import mongoose,{Schema} from "mongoose";


const ApplyingSchema=new Schema({
    userid:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    projectid:{
        type:Schema.Types.ObjectId,
        ref: "Project",
        required:true
    },
    Status:{
        type:String,
        required: true,
        default: "Applied"
    },
    Acceptance:{
        type: Boolean,
        default: false
    }

},{
    timestamps:true


})

export const Applied=mongoose.model("Applied",ApplyingSchema)