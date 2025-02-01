import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
     //get user detail from frontend
     //validation -not empty
     //check if user already exist
     //check for images ,check for avatar
     //uppload them is claudinary
     //create user object -create entry in db
     // remove password and refresgh token field from resonse
     //check user creatiom
     // return response
    
        // req.body   for info coming through form and json but url
        // req.params for url parameters


    const {fullName,email,username,password}=req.body
    //console.log("email:",email);

    // if(fullName === "") {
    //     throw new ApiError(400, "Full name is required");
    // }
   
    //field?.trim() ensures that field is not undefined or null before calling .trim().
    
    if ([fullName, email, username, password].some((field) => {
        return field?.trim() == "";
    })){
        throw new ApiError(400,"all fields are required ");
    }

    const exitedUser= await User.findOne({
        $or:[
            {username},
            {email}

        ]
    })
    if(exitedUser){
        throw new ApiError(409,"User already exists");
    }
    //res.body is given by express 
    // as we added midlle of multer in route so that it get further more option like res.files
    //console.log(req.files);
    const avatarLocalPath=req.files?.avatar[0]?.path;
    //const coverLocalPath=req.files?.coverImage[0]?.path;
    // showing error if cover image is not uploaded in uppercode so use classical way
    let coverLocalPath;
    if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage,length>0){
        coverLocalPath=req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file required ");
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverLocalPath);

    if(!avatar){
        throw new ApiError(500,"Failed to upload avatar image");
    }
    
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url,
        email,
        username:username.toLowerCase(),
        password,
    });
    //If the variable name matches the model field name, JavaScript automatically maps them (fullName: fullName, email: email, etc.).
//  For computed values (avatar.url, coverImage?.url, username.toLowerCase()), they are explicitly assigned.
 
    const createdUser=await User.findById(user._id).select("-password -refreshToken");
    //kya kya nhi chaiye in select
    if(!createdUser){
        throw new ApiError(500,"Failed to create user");
    }
    


    return res.status(201).json(
        //can be done only by created user
        new ApiResponse(200,createdUser,"User created successfully")
    )

    

});




export {registerUser,
    loginUser
};