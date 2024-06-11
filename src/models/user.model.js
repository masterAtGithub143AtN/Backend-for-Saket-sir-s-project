import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        fullname:{
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password:{
            type: String,
            required: true,
            trim: true,
        },
        rollnumber:{
            type: String,
            required: true,
            unique: true,
            UpperCase: true,
        },
        collegename:{
            type: String,
            required: true,
            unique: true,
            UpperCase: true,
            trim: true,
        },
        resume:{
            type:String,
        },
        semester:{
            type:Number,
            required: true,
            trim: true,
        },
        intern:{
            type:Boolean,
            default:false
        },
        admin:{
            type: Boolean,
            default: false
        },
        securitycodeofadmin:{
            type:String,
            default: ""
        },
        projects:{
            type:Array,
            default:[]
        },
        refreshToken:{
            type:String
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password=await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema);