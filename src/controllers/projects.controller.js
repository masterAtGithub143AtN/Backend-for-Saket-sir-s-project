import { Institutes } from "../models/institutes.modal.js";
import { ProjectsDB } from "../models/projects.model.js";
import { ApiERROR } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";





const Addprojects=asyncHandler(async(req,res)=>{
    const {projectname,projectdetails}=req.body
    if([projectdetails,projectname].some((field)=> field.trim==="")){
        throw new ApiERROR(400,"All fields are required")
    }
    const existedProjects=await ProjectsDB.findOne({projectname})
    if(existedProjects){
        throw new ApiERROR(400, "This project is already added")
    }
    const addedproject=await ProjectsDB.create({
        projectname,
        projectdetails
    })
    if(!addedproject){
        throw new ApiERROR(500,"Something went wrong while adding new projects")
    }
    return res.status(200).json(new ApiResponse(200,{project:addedproject},"You have added a new project"))
})
const deletproject=asyncHandler(async(req,res)=>{
    const projectname=req.query.name
    const id=req.query.id
    if(id?.trim()===""){
        throw new ApiERROR(400,"project Id is required")
    }
    const project=await ProjectsDB.findById(id)
    if(!project){
        throw new ApiERROR(400,"This college is not exsit")
    }
    const response=await ProjectsDB.deleteOne(project)
    if(!response){
        throw new ApiERROR(500,"Something went wrong while deleting project details")
    }
    return res.status(200).json(new ApiResponse(200,{},"project details deleted successfully"))
})


const getAllprojects=asyncHandler(async(req,res)=>{
    const projects=await ProjectsDB.find({})
    if(!projects){
        throw new ApiERROR(500,"There is not any project in list or Got something wrong while getting projects list")
    }
    return res.status(200).json({
        "statuscode": 200,
        "Data": projects,
        "message": "Success"
    })

})

export {Addprojects,deletproject,getAllprojects}