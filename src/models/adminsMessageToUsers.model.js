import mongoose,{Mongoose, Schema} from "mongoose";
import bcrypt from "bcrypt"

const AdminMessagetoUsers=new Schema({
    userid:{
        type: Schema.Types.ObjectId,
        ref: "User",
        reuired: true
    },
    message:{
        type: String,
        required: true
    }
})

AdminMessagetoUsers.pre("save",async function(next){
    if(!this.isModified("message")){
        return next()
    }
    this.message=await bcrypt.hash(this.message,10);
    next()
})

export const AdminTUM=mongoose.model("AdminTUM",AdminMessagetoUsers)