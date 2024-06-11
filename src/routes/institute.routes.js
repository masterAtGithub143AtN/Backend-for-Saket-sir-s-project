import { Router } from "express";
import { addInstitues, deletCollegeName, getAllcollege } from "../controllers/institutes.controllers.js";
import { verifyAdmin } from "../middlewares/auth.middleware.admin.js";


const institutesRouter=Router()

institutesRouter.route("/addinstitute").post(verifyAdmin, addInstitues)
institutesRouter.route("/deleteinstitute").delete(verifyAdmin, deletCollegeName)
institutesRouter.route("/getallinstitutes").get(getAllcollege)


export default institutesRouter