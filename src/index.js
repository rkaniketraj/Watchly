//import mongoose from "mongoose"
//require('dotenv').config({path:'./env'})


//this dot env ganda lag rja reuire use karna import ke  upar
//toh isliaya ham imort syntax use kar rahe hai aur packagejson mai bhi change kar rahe
// dev mai change kar rahe hai
//dotenv ,env fast boot karne mai help karta hai jisse saare file mai env access pahuch jaye

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({
    path:'./env'
})
// 8000 is usd to default connection when port not free.
//connectcb return promise after connection with database
connectDB()
.then(()=>{
    app.on("error", (error) => {
        console.log("ERRR: ", error);
        throw error;
    });
    //The "error" event is a special event commonly used to handle errors in Node.js application
    //app.on() listens for events emitted by the app object.
    //When the specified event (in this case, "error") is triggered, the provided callback function is executed.
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port:${process.env.PORT}`);
    })
    // This ensures that the Express server (app.listen) only starts listening for incoming requests after the database connection is successfully established.
})
.catch((err)=>{
    console.log("MongoDb connection failed ...",err)
})