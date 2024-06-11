import { Router } from "express";
import { changeCurrentPassword, loginUser, logoutUser, messageToAdmin, refreshAccessToken, registerUser, updateAccountDetails } from "../controllers/user.controller.js";
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

userRouter.route("/logout").get(verifyJWT,logoutUser)
userRouter.route("/refresh-token").get(refreshAccessToken)
userRouter.route("/changepassword").put(verifyJWT,changeCurrentPassword)
userRouter.route("/update").put(verifyJWT,updateAccountDetails)
userRouter.route("/sendmessage").post(verifyJWT,messageToAdmin)
export default userRouter