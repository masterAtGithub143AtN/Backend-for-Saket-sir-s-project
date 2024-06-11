import jwt, { decode } from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiERROR } from "../utils/ApiError.js"
import { Admin } from "../models/admin.model.js"



export const verifyAdmin=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer","")
        if(!token){
            throw new ApiERROR(400, "Unathorized access")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const admin=await Admin.findById(decodedToken?._id).select("-password -refreshToken")
        if(!admin){
            throw new ApiERROR(400,"Invalid accesstoken")
        }
        req.admin=admin
        // console.log(req.admin.fullname)
        next()
    } catch (error) {
        throw new ApiERROR(400, error?.message|| "Invalid access token")
    }
})