import { Router } from "express";
import { adminChangeCurrPassword, adminDoingMessageToUser, adminEvaluating, adminGetAllInternshipRequests, adminGetAllUser, adminLogin, adminLogout, adminRegister, adminUpdate, deleteMessageToUser, getCurrentAdmin, getMessageOfUsers } from "../controllers/admin.controllers.js";
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
adminRouter.route("/admindeletemessage").delete(verifyAdmin,deleteMessageToUser)
adminRouter.route("/admincurrent").get(verifyAdmin,getCurrentAdmin)
adminRouter.route("/getmessageofuser").get(getMessageOfUsers)
adminRouter.route("/getInternshipRequests").get(verifyAdmin,adminGetAllInternshipRequests)
export default adminRouter