import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
//jwt is bearertoken 
const userSchema= new Schema(
    {
        username:{
            type:String,
            requried:true,
            unquie:true,
            lowercase: true,
            trim: true,
            index: true,
            //index is true for fat searching user
        },
        fullName :{
            type: String,
            required :true,
            trim: true,
            index: true
        },
        avatar :{
            type: String,
            required: true
        },
        coverImage:{
            type : String
        },
        watchHistory:[
            {
                type:Schema.Type.ObjectId,
                ref:"Video"
            }
        
        ],
        password:{
            type: String,
            requried:[true,'pasword is required']
        },
        refreshToken :{
            type: String
        }


    }
    ,{
        timesatmps:true
    }
)
//event are save delete and more pre mean before doin this do this
//nor use => { }bcz it soent support this means not have context
//this.isModified is use to when pssw only modifed then dycrpt
userSchema.pre("save", async function(next){
    if(!this.isModified("password"))return next();
    this.password=bcrypt.hash(this.password,10)
    next()
})
//we design coustom method 


userSchema.method.isPasswordCorrect=async function(password){
  return  await bcrypt.compare(password,this.password)
}
userSchema.method.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            eamil: this.email,
            username: this.username,
            fullname: this.fullName

            
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.method.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,  
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User =mongoose.model("User",userSchema)