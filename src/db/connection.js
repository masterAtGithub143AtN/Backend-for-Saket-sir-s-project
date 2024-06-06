import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB=async ()=>{
    try {
        const connectioInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MONGODB connected !! DB HOST: ${connectioInstance}`);
    } catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1)
    }
}

export default connectDB;