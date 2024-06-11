import { Institutes } from "../models/institutes.modal.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";





const addInstitues=asyncHandler(async(req,res)=>{
    const {name}=req.body
    if(name.trim===""){
        throw new ApiERROR(400,"Collegename is required")
    }
    const addedCollege=await Institutes.create({
        name
    })
    if(!addedCollege){
        throw new ApiERROR(500,"Something went wrong while adding name of college")
    }
    return res.status(200).json(new ApiResponse(200,{college:name},"You have added collegeName successfully"))
})

const deletCollegeName=asyncHandler(async(req,res)=>{
    const {name}=req.query.name
    const {id}=req.query.id
    if(id.trim===""){
        throw new ApiERROR(400,"College Id is required")
    }
    const college=await Institutes.findById(id)
    if(!college){
        throw new ApiERROR(400,"This college is not exsit")
    }
    const response=await Institutes.deleteOne(college.name)
    if(!response){
        throw new ApiERROR(500,"Something went wrong while deleting college name")
    }
    return res.status(200).json(new ApiResponse(200,{},"College name deleted successfully"))
})


const getAllcollege=asyncHandler(async(req,res)=>{
    const college=await Institutes.find({})
    if(!college){
        throw new ApiERROR(500,"There is not any college in list or Got something wrong while getting college list")
    }
    return res.status(200).json(new ApiResponse(200,{colleges:college},"You got college list successfully"))

})


export {addInstitues,deletCollegeName,getAllcollege}