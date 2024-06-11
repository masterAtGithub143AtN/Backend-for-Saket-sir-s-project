// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import express from "express"
import connectDB from "./db/connection.js";
import { app } from "./app.js";
import { User } from "./models/user.model.js";

dotenv.config({
    path: './env'
})



connectDB().then(()=>{
    app.on("error",(err)=>{
        console.log("ERROR :",err);
        throw err;
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port :${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("MONGODB connection failed in index.js file !!!",err);
})






















/*

;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(err)=>{
            console.log("ERROR: ",err);
            throw err
            
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
})() */