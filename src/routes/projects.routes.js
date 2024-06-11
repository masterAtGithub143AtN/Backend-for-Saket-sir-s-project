import { Router } from "express";
import { verifyAdmin } from "../middlewares/auth.middleware.admin.js";
import { Addprojects, deletproject, getAllprojects } from "../controllers/projects.controller.js";


const projectRouter=Router();

projectRouter.route("/addprojects").post(verifyAdmin,Addprojects)
projectRouter.route("/deleteprojects").delete(verifyAdmin,deletproject)
projectRouter.route("/getallprojects").get(getAllprojects)

export default projectRouter