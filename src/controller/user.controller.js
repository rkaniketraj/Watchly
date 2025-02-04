import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

//gernerating method as it required multipe time
const generateAccessAndRefereshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;
         // add but havent save the user
         //when save is instiialised monfoose model get kickedmin then as model of user cintain password reqired abd we just giving it refresh token then throw an eroro
        await  user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}




    }catch{
        throw new ApiError(500,"something wronge while generating ref and acc token")
    }
}

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

const loginUser=asyncHandler(async(req,res)=>{
    // req body ->data
    //username or email
    //find the user 
    //password check
    //accesss and refresh token
    //send cookie

    const {email,username,password}=req.body;
    if(!username&&!email){
        throw new ApiError(400,"username or password is required")
    }
    const user=await User.findOne({
        $or:[
            {username},
            {email}
        ]
        //find the user basis of username or email if any find then it give that user
    })
    if(!user){
        throw new ApiError(404,"User not found");
    }
    //user is in data base User(mongodb object) a user from it 
    const isPasswordValid=await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Wronge Password");
    }

    const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id)
    // we have updated the refresh token in user by upper step but user is actually pointing to previous user even now
    // so he havnt refreh token so we have to find again for this user_id (optional step)
    const loggedInUser=await User.findById(user_id).select("-password -refreshToken")

    //by doing this cookie only can be modified by server not by frontend
    const options={
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .cookie("accesstoken",accessToken,options)
    .cookie("refreshtoken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "user logged in successfully"

        )
    )

});
//.cookie is acces by bcz app.use(cookie-parsor)

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }

        },
        {
            new : true
        }
    )
    const options={
        httpOnly : true,
        secure : true
    }
    return res.
    status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{},"usser logged Out"))


})



export {registerUser,
    loginUser,
    logoutUser
};