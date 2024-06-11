import { Admin } from "../models/admin.model.js";
import { AdminMFU } from "../models/adminsMessage.model.js";
import { AdminTUM } from "../models/adminsMessageToUsers.model.js";
import { User } from "../models/user.model.js";
import { ApiERROR } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const generateAccessRefreshTokenForAdmin=async (userId)=>{
    try {
        const userAdmin=await Admin.findById(userId)
        const AccessTokenAdmin=await userAdmin.generateAccessToken()
        const RefreshTokenAdmin=await userAdmin.generateRefreshToken()
        userAdmin.refreshToken=RefreshTokenAdmin
        await userAdmin.save({validateBeforeSave:false})
        return {AccessTokenAdmin,RefreshTokenAdmin}
    } catch (error) {
        throw new ApiERROR(500,"Something went wrong while generating refresh and access token")
    }
}


const adminRegister=asyncHandler(async(req,res)=>{
    const {fullname,email,password,username,collegename}=req.body
    if([username,email,password,collegename,fullname].some((field)=> field==="")){
        throw new ApiERROR(400,"All fiels are required")
    }
    const existedAdmin=await Admin.findOne({
        $or:[{username},{email}]
    })
    if(existedAdmin){
        throw new ApiERROR(400,"Admin with this username or email already axists")
    }
    const admin=await Admin.create({
        username,
        fullname,
        email,
        password,
        collegename
    })
    const createdAdmin=await Admin.findById(admin._id).select("-password")
    if(!createdAdmin){
        throw new ApiERROR(500,"Something went wrong while registering !")
    }
    return res.status(200).json(new ApiResponse(200,createdAdmin,"Admin registered successfully"))
})


const adminLogin=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body
    if(!(email || username)){
        throw new ApiERROR(400,"Username or password is required")
    }
    if(password===""){
        throw new ApiERROR(400,"Password is required")
    }
    const loginAdmin=await Admin.findOne({
        $or:[{username},{email}]
    })
    if(!loginAdmin){
       throw new ApiERROR(400,"Admin not found")
    }

    const isPasswordCorrect=await loginAdmin.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiERROR(400,"Inavlid password")
    }
    const {AccessTokenAdmin,RefreshTokenAdmin}=await generateAccessRefreshTokenForAdmin(loginAdmin?._id)
    const logeddInAdmin=await Admin.findById(loginAdmin?._id).select("-password -refreshToken")
    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
              .cookie("accesstoken",AccessTokenAdmin,options)
              .cookie("refreshtoken",RefreshTokenAdmin,options)
              .json(new ApiResponse(
                200,
                {admin: logeddInAdmin,AccessTokenAdmin,RefreshTokenAdmin},
                "You are loggedIn Successfully"
              ))
            

})


const adminLogout=asyncHandler(async (req,res)=>{
    await Admin.findByIdAndUpdate(
        req.admin?._id,
        {
            $set: {refreshToken:undefined}
        },
        {
            new: true
        }
    )
    const options={
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accesstoken",options).clearCookie("refreshtoken",options).json(new ApiResponse(200,{},"Logout Successfully"))
})

const adminUpdate=asyncHandler(async (req,res)=>{
    const admin=req.admin;
     const {email,fullname,collegename}=req.body
     if([email,fullname,collegename].some((field)=> field==="")){
        throw new ApiERROR(400, "All fields are required")
     }
     const existedEmail=await Admin.find({email})
     if(existedEmail.length>=2){
        throw new ApiERROR(400,"this email is already registered by another admin")
     }
    if(existedEmail.length==1 && admin.username!=existedEmail[0].username){
        throw new ApiERROR(400,"this email is already registered by another admin")
    }
    // console.log(req.admin)
    const newAdmin=await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $set:{
                fullname,
                email,
                collegename
            }
        },
        {
            new :true
        }
    ).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200,{admin:newAdmin},"Changes saved successfully"))
})

const adminChangeCurrPassword=asyncHandler(async (req,res)=>{
    const {oldpassword,newpassword}=req.body
    if([oldpassword,newpassword].some((field)=> field==="")){
        throw new ApiERROR(400," All the fileds are required")
    }
    const admin=await Admin.findById(req.admin?._id);
    const isPasswordCorrect=await admin.isPasswordCorrect(oldpassword)
    if(!isPasswordCorrect){
        throw new ApiERROR(400,"Wrong password")
    }
    admin.password=newpassword;
    await admin.save({validateBeforeSave:false})
    const options={
        httpOnly: true,
        secure: true
    }
    return res.status(200)
              .clearCookie("accesstoken",options)
              .clearCookie("refreshtoken",options)
              .json(new ApiResponse(200,{},"Password changed successfully"))
})


const adminGetAllUser=asyncHandler(async(req,res)=>{
    const AllUser=await User.find({}).select("-password -refreshToken")
    if(!AllUser){
        throw new ApiERROR(500,"Something went wron")
    }
    return res.status(200).json(new ApiResponse(200,{AllUser:AllUser},"User fetched successfully"))
})

const adminEvaluating=asyncHandler(async (req,res)=>{
    const id=req.query.id
    const acceptance=req.query.acceptance
    const {message,userprojects}=req.body
    if([id,acceptance,message].some((field)=> field==="")){
        throw new ApiERROR(400,"All fields are required")
    }
    const user=await User.findById(id)
    if(!user){
        throw new ApiERROR(400,"User doesnot exist")
    }
    if(!(acceptance==="YES" || acceptance==="NO")){
        throw new ApiERROR(400,"Please select only one as it is from YES or NO")
    }
    if(acceptance==="YES"){
        if(userprojects===null){
            throw new ApiERROR(400,"When you are accepting the applicant as an Intern you have to give him aleast one project")
        }
        user.intern=true
        user.projects=userprojects
        try {
            await user.save({validateBeforeSave:false})
        } catch (error) {
            throw new ApiERROR(500,error?.message || "Something went wrong while saving project details")
        }
        const messageforUser=await AdminTUM.create({
            message:message,
            userid:id
        })
        if(!messageforUser){
            throw new ApiERROR(500,"something went wrong while sending message to User")
        }
        return res.status(200).json(new ApiResponse(200,{},"User successfully became your intern"))

    }
    else{

        const messageforUser=await AdminTUM.create({
            message:message,
            userid:id
        })
        if(!messageforUser){
            throw new ApiERROR(500,"something went wrong while sending message to User")
        }
        return res.status(200).json(new ApiResponse(200,{},"you have successfully rejected intern request"))
    }

})

const adminDoingMessageToUser=asyncHandler(async (req,res)=>{
    const id=req.query.id
    const {message}=req.body
    if([id,message].some((field)=> field==="")){
        throw new ApiERROR(400,"All fields are required")
    }
    const user=await User.findById(id)
    if(!user){
        throw new ApiERROR(400,"User does not exist")
    }
    const sendedMessage=await AdminTUM.create({
        userid:id,
        message
    })
    if(!sendedMessage){
        throw new ApiERROR(500,"Something went wrong while sending message")
    }
    return res.status(200).json(new ApiResponse(200,{},"You have sended message to user successfully"))
})

export {adminRegister,adminLogin,adminLogout,adminUpdate,adminChangeCurrPassword,adminGetAllUser,adminEvaluating,adminDoingMessageToUser}