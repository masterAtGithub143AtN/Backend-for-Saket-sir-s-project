import { Admin } from "../models/admin.model.js";
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
    
})

export {adminRegister,adminLogin,adminLogout,adminUpdate,adminChangeCurrPassword,adminGetAllUser}