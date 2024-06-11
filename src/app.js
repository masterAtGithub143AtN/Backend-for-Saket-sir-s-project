import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js"
import adminRouter  from "./routes/admin.routes.js";
import projectRouter from "./routes/projects.routes.js";
import institutesRouter from "./routes/institute.routes.js";

//routes declaration

app.use("/api/v1/users",userRouter)
app.use("/api/v1/admin",adminRouter)
app.use("/api/v1/project",projectRouter)
app.use("/api/v1/institute",institutesRouter)

console.log("app");


export {app}


