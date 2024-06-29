import mongoose,{Schema} from "mongoose";


const projectSchema=new Schema(
    {
        projectname:{
            type:String,
            required:true,
        },
        projectdetails:{
            type:String,
            required:true
        },
        projecctimage:{
            type:String
        },
        assigned:{
            type:Boolean,
            default:false
        },
        multiasigning:{
            type:Boolean,
            default:false
        }
    },
    {
        timestamps:true
    }
)

export const ProjectsDB=mongoose.model("ProjectsDB",projectSchema)