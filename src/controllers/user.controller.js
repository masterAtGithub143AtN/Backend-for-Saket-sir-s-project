import { asyncHandler } from "../utils/asyncHandler.js";



const registerUser=asyncHandler(async (req,res)=>{
    console.log("user.controller")
    res.status(200).json({
        message: "ok"
    })
})

export {registerUser}