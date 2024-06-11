import { Router } from "express";
import { changeCurrentPassword, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
// import { ApiERROR } from "../utils/ApiError.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const userRouter=Router()
userRouter.route("/register").post(
    upload.fields([
        {
            name: "resume",
            maxCount: 1
        }
    ]),
    registerUser
)

userRouter.route("/login").post(upload.fields([{
    name: "nothing",
    maxCount: 0
}]),loginUser)

//secured routes

userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/changepassword").post(verifyJWT,changeCurrentPassword)
userRouter.route("/update").post(verifyJWT,updateAccountDetails)
export default userRouter