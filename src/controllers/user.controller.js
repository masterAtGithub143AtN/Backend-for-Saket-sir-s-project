import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiERROR } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { AdminMFU } from "../models/adminsMessage.model.js";
import { Applied } from "../models/Apply.model.js";


const generateAccessRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=await user.generateAccessToken()
        const refreshToken=await user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiERROR(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser=asyncHandler(async (req,res)=>{
    //get user details from frontend
    //validation of recieved data from frontend
    //check is user already axists: username,email
    //check for image
    //upload them on cloudinary
    //create user object-create entry in db
    //check for user creation
    //return res

    const {fullname,email,username,password,rollnumber,collegename,semester}=req.body
    if(
        [fullname,username,email,rollnumber,collegename,semester,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiERROR(400,"All fields are required")
    }
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiERROR(409,"User with email or username already exists")
    }
    // const resumeLocalPath=req.files?.resume[0]?.path;
    // if(!resumeLocalPath){
    //     throw new ApiERROR(400,"Resume is required")
    // }

    // const resume=await uploadOnCloudinary(resumeLocalPath)
    // if(!resume){
    //     throw new ApiERROR(500,"Registeration fail try again")
    // }



    const user=await User.create({
        fullname,
        resume: "",
        // avatar:avatar?.url || "",
        email,
        password,
        username,
        rollnumber,
        semester,
        collegename
    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiERROR(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

// const loginUser = asyncHandler(async (req, res) => {
//     const { email, username, password } = req.body;

//     if (!(username?.trim() || email?.trim())) {
//         throw new ApiERROR(400, "Username or email is required");
//     }

//     const user = await User.findOne({
//         $or: [{ username }, { email }],
//     });

//     if (!user) {
//         // Distinguish user not found error
//         return res.status(404).json({
//             message: "User does not exist",
//             errorType: "USER_NOT_FOUND"
//         });
//     }

//     const isPasswordValid = await user.isPasswordCorrect(password);
//     if (!isPasswordValid) {
//         // Distinguish invalid password error
//         return res.status(401).json({
//             message: "Invalid password",
//             errorType: "INVALID_PASSWORD"
//         });
//     }

//     const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);
//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

//     const options = {
//         httpOnly: true,
//         secure: true
//     };

//     return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
//         new ApiResponse(
//             200,
//             {
//                 user: loggedInUser, accessToken, refreshToken
//             },
//             "User logged in successfully"
//         )
//     );
// });





const loginUser=asyncHandler(async (req,res)=>{
    //req body-> data
    // username or email
    // find the usser
    // password check
    //access and refresh token
    //send cookie

    const {email,username,password}=req.body
    if(!(username || email)){
        throw new ApiERROR(400,"username or email is required")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiERROR(404,"User does not exist")
    }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiERROR(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessRefreshToken(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly: true,
        secure: true
    }

    // return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
    //     new ApiResponse(
    //         200,
    //         {
    //             user: loggedInUser,accessToken,refreshToken
    //         },
    //         "User logged In successfully"
    //     )
    // )

    return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));


})






const DirectloggedIn=asyncHandler(async(req,res)=>{
    return res.status(200).json({
        message:"success",
        status:200
    })
})

const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }

        },
        {
            new : true
        }
    )

    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logged Out"))


})

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiERROR(401,"Unathorized request")
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiERROR(401,"Invalid refresh token")
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiERROR(401,"Refresh token is expired or used")
        }
    
        const options={
            httpOnly: true,
            secure: true
        }
        const {accessToken,refreshToken}=await generateAccessRefreshToken(user._id)
        // console.log(accessToken)
        // console.log(refreshToken)
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(
            200,
            {accessToken: accessToken,refreshToken:refreshToken},
            "Access token refreshed"
        ))
    } catch (error) {
        throw new ApiERROR(401,error?.message|| "Invalid refresh token")
    }

})


const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const {oldpassword,newpassword}=req.body
    if([oldpassword,newpassword].some((field)=> field?.trim()==="")){
        throw new ApiERROR(400,"All fields are required")
    }
    const user=await User.findById(req.user?._id)

    const isPasswordCorrect=await user.isPasswordCorrect(oldpassword)

    if(!isPasswordCorrect){
        throw new ApiERROR(400,"INVALID PASSWORD")
    }
    user.password=newpassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))

})


const getCurrentUser=asyncHandler(async (req,res)=>{
    // console.log(req.user)
    return res.status(200).json({
        status:200,
        Data:req.user,
        message:"current user fetched"
    })
})

const updateAccountDetails=asyncHandler(async (req,res)=>{
    const {fullname,email,collegename,semester,rollnumber}=req.body
    if([fullname,email,collegename,semester,rollnumber].some((field)=>field?.trim()==="")){
        throw new ApiERROR(400,"All fields are required")
    }
   const user= User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email,
                semester,
                collegename,
                rollnumber
            }
        },
        {new:true}
    ).select("-password")
    return res.status(200).json(200,user,"Account details updated successfully")
})


const messageToAdmin=asyncHandler(async(req,res)=>{
    const {message,projectid}=req.body
    if(message?.trim()===""){
        throw new ApiERROR(400,"Please type some message")
    }
    if(message.length>100){
        throw new ApiERROR(400,"Write your message in 100 characters")
    }
    const sendedmessage=await AdminMFU.create({
        userid:req.user._id,
        message,
        projectid:projectid
    })
    if(!sendedmessage){
        throw new ApiERROR(500,"Something went wrong while sendin message")
    }
    return res.status(200).json(new ApiResponse(200,{message:sendedmessage},"You have sended message successfully"))
})
const deleteMessageToadmin=asyncHandler(async(req,res)=>{
    const id=req.query.id
    if(id?.trim()===""){
        throw new ApiERROR(400,"Message Id is required")
    }
    const messaged=await AdminMFU.findById(id)
    if(!messaged){
        throw new ApiERROR(400,"there is nothing with this id")
    }
    const deletedmessage=await AdminMFU.deleteOne(messaged)
    if(!deletedmessage){
        throw new ApiERROR(500,"something went wrong while deleting your message")
    }
    return res.status(200).json(new ApiResponse(200,{},"Message deleted succcessfully"))
})


const ApplyingUser=asyncHandler(async(req,res)=>{
    const id=req.body.id;
    const projectid=req.body.projectid;
    const Status=req.query.Status;
    if(id?.trim()==="" || Status?.trim()===""){
        throw new ApiERROR(400,"All fields are required!")
    }
    const FindingUser=await User.findById(id);
    if(!FindingUser){
        throw new ApiERROR(400,"User does not exist")
    }
    const AllReadyApplied=await Applied.findOne({userid:id,projectid:projectid})
    if(AllReadyApplied){
        throw new ApiERROR(400,"You have already applied for this project")
    }
    const CreatedRequest=await Applied.create({
        userid: id,
        Status:"Applied",
        projectid:projectid
    })
    if(!CreatedRequest){
        throw new ApiERROR(500,"Something went wrong while sending request")
    }
    return res.status(200).json({
        status:200,
        message:"Successfully sent"
    })
})

const getRequestStatus=asyncHandler(async(req,res)=>{
    const AllAppliedlist = await Applied.find({ userid: req.user._id});
    return res.status(200).json({
        status: 200,
        message:"success",
        Data:AllAppliedlist
    })
})
const cancelRequest=asyncHandler(async(req,res)=>{
    const projectid=req.query.projectid;
    if(projectid?.trim()===""){
        throw new ApiERROR(400,"Project Id is required")
    }
    const request=await Applied.findOne({userid:req.user._id,projectid})
    if(!request){
        throw new ApiERROR(400,"You have not applied for this project")
    }
    const deletedRequest=await Applied.deleteOne(request)
    if(!deletedRequest){
        throw new ApiERROR(500,"Something went wrong while deleting request")
    }
    return res.status(200).json({
        status:200,
        message:"Request deleted successfully"
    })
})




export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,messageToAdmin,deleteMessageToadmin,DirectloggedIn,ApplyingUser,getRequestStatus,cancelRequest}