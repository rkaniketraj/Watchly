import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema=new Schema(
    {
        videoFile:{
            type: String,
            required: true
        },
        Thumbnail:{
            type: String,
            required: true
        },
        title:{
            type: String,
            required: true
        },
        discription:{
            type: String,
            required: true
        },
        duration:{
            type: Number,
            required: true
        },
        views :{
            type: Number,
            default: 0
        },
        owner:{
            type : Schema.Types.ObjectId,
            ref :"User"
        }



    },
    {
        timesatmps: true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)