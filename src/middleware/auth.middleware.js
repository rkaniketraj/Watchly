import { ApiError } from "../utils/ApiError.js";
import { asyncHandler  }  from "../utils/asyncHandler.js"
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