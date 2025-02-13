import { ApiError } from "../utils/ApiError";
import { asyncHandler  }  from "../utils/asyncHandler"
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const  verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(
                401,"unotherized request"
            )
        }
        //we send id email to jwt token therefor token contain id email
    
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //give decoded info of email id fullname and other we provided during making of this
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            // TODO:discuss about todo
            throw new ApiError(401,"Invalid acess Token")
        }
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message||"invalid access token");

    }
    
})
//  Suppose a request is made with an invalid token.

// 1️⃣ Inside your function:

// jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) throws an error.
// catch (error) { throw new ApiError(401, "Invalid access token"); } runs.
// The function throws an ApiError.

// 2️⃣ Inside asyncHandler:

// The function is wrapped inside Promise.resolve().
// Since it throws an error, the promise is rejected.
// .catch((err) => next(err)) catches the error and forwards it to Express

// Your function’s catch (error) acts first and transforms the error.
// ✅ Then, asyncHandler catches that thrown error and sends it to Express for handling.

// Without asyncHandler, Express wouldn’t catch the error properly.
// You would have to manually wrap all async functions in try-catch, which is inefficient.