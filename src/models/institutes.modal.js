import mongoose,{Schema} from "mongoose";

const instituteSchema=new Schema(
    {
        name:{
            type:String,
            required: true,
            trim:true,
            LowerCase: true,
        }
    },
    {
        timestamps:true
    }
)

export const Institutes=mongoose.model("Institutes",instituteSchema)