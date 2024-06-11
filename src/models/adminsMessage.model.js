import mongoose,{Model, Schema} from "mongoose";
import bcrypt from "bcrypt"

const AdminMessageFromUsers=new Schema({
    userid:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    message:{
        type:String,
        required: true
    }
})

AdminMessageFromUsers.pre("save",async function(next){
    if(!this.isModified("message")){
        return next()
    }
     this.message=await bcrypt.hash(this.message,10);
     next()
})


export const AdminMFU=mongoose.model("AdminMFU",AdminMessageFromUsers);