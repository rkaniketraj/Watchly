import mongoose ,{Schema}from "mongoose";

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
        fullname :{
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


export const User =mongoose.model("User",userSchema)