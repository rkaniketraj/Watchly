import express from "express"
import cors from "cors"
//import cookieParseer from "cookie-parser"
import cookieParser from "cookie-parser";
const app =express();
//app.use  fro configurtaion seeting eur use midlleware

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    Credential: true
}))
//Your frontend is running on http://localhost:3000.
// Your backend API is on http://localhost:5000.
// If the frontend tries to fetch data from http://localhost:5000, the browser blocks the request unless CORS is enabled.

// all are middle ware transfer data from client enable t server
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
 
//route import
import userRouter from "./routes/user.routes.js"

//route decleartion

app.use("/api/v1/users",userRouter)



export {app}
//can export default app


