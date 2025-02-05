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
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"usser logged Out"))


})


// f the refreshToken is valid and not expired, a new access token and a new refresh token are generated.
// The new refresh token replaces the old one in cookies and the database to prevent token reuse.
// This process continues as long as the user stays active within the refresh token’s expiration period.
const refreshAccessToken =asyncHandler(async(req,res)=>{
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
 
    if(!incomingRefreshToken){
     throw new ApiError(401,"unauthorised request");
    }
    try {
        const decodedToken=jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
        )
        //this give user info which is put with secrest to form jwt token
    
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"invalid refres token")
        }
        
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"refresh token is experied or used")
        }
        //now we have to change the refreshtoken and this refrefh again so cant use same token again
    
        const option=
        {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookies("accessToken",accessToken,option)
        .cookies("refreshTOken",newRefreshToken,option)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken: newRefreshToken,
                   
                },
                "acccess token refresh",
            )
        )
        
    } catch (error) {
        throw new ApiError(401,error?.message||"invalid refresh token")
    }




 
 
 
 })

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    //taking oldpassword and new password form the user
    const {oldPassword,newPassword}=req.body;
    const user =await User.findById(req.user?._id)
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect ){
        throw new ApiError(400,"Invalid Password");
    }
    user.password=newPassword;
    //this is going to save next but we defein pre in user model that encrypt the password before save

    await user.save({
        valdiatieBeforeSave: false 
    });

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password change successfully"))




})

const getCurrentUser=asyncHandler(async(req,res)=>{
    //const user = User.findById(req.user?._id);
    return res
    .status(200)
    .json(200,req.user,"currect user fetched successfully")

})

const updateAccountDetail=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body;
    if(!fullName||!email){
        throw new ApiError(400,"All field are required")
    }
    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {

            $set:{
                fullName,
                email: email

            }
        },
        {new : true}
        //update hone ke baad new info pass hoti hai
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"account detail updated sucessfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"AvaTatr file is missing")

    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"error while uploading the file")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")
 
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )


})
const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage file is missing")

    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"error while uploading the coverimage")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )


})





export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserCoverImage

};