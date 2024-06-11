import { Router } from "express";
import { adminChangeCurrPassword, adminDoingMessageToUser, adminEvaluating, adminGetAllUser, adminLogin, adminLogout, adminRegister, adminUpdate } from "../controllers/admin.controllers.js";
import { verifyAdmin } from "../middlewares/auth.middleware.admin.js";

const adminRouter=Router()


adminRouter.route("/adminregister").post(adminRegister)
adminRouter.route("/adminlogin").post(adminLogin)

// secure
adminRouter.route("/adminlogout").get(verifyAdmin, adminLogout)
adminRouter.route("/adminupdate").put(verifyAdmin,adminUpdate)
adminRouter.route("/adminchangepassword").put(verifyAdmin,adminChangeCurrPassword)
adminRouter.route("/admingetusers").get(verifyAdmin,adminGetAllUser)
adminRouter.route("/adminevaluate").post(verifyAdmin,adminEvaluating)
adminRouter.route("/adminmessage").post(verifyAdmin,adminDoingMessageToUser)
export default adminRouter