import express from "express"
import cors from "cors"
import cookieParseer from "cookie-parser"
import cookieParser from "cookie-parser";
const app =express();
//app.use  fro configurtaion seeting eur use midlleware

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    Credential: true
}))
// all are middle ware transfer data from client enable t server
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
 




export {app}
//can export default app


