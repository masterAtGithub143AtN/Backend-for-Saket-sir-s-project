import { Router } from "express";
import { adminChangeCurrPassword, adminGetAllUser, adminLogin, adminLogout, adminRegister, adminUpdate } from "../controllers/admin.controllers.js";
import { verifyAdmin } from "../middlewares/auth.middleware.admin.js";

const adminRouter=Router()


adminRouter.route("/adminregister").post(adminRegister)
adminRouter.route("/adminlogin").post(adminLogin)

// secure
adminRouter.route("/adminlogout").get(verifyAdmin, adminLogout)
adminRouter.route("/adminupdate").post(verifyAdmin,adminUpdate)
adminRouter.route("/adminchangepassword").post(verifyAdmin,adminChangeCurrPassword)
adminRouter.route("/admingetusers").get(verifyAdmin,adminGetAllUser)
export default adminRouter