import { User } from "../models/user.model.js"
import { ApiERROR } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"


export const verifyJWT=asyncHandler(async (req,res,next)=>{
    try {
        // Object.keys(req).forEach((prop)=> console.log(prop));
        console.log("request")
        // console.log(req.user)
        const token=req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiERROR(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiERROR(401,"Invalid Access Token")
        }
        
        console.log(typeof(req.user))

        req.user=user;
        console.log(typeof(req.user))
        console.log(typeof(req))
        console.log(req.user)
        next()
    } catch (error) {
        throw new ApiERROR(401,error?.message || "Invalid access token")
    }
})