import mongoose, {Aggregate, isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const baseQuery = {}

    if (query) {
        baseQuery.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }
    //Flexible searches → Finds partial matches (e.g., searching "Node" will match "Node.js").
// Better user experience → Case-insensitive search ($options: "i").
// Supports advanced matching → Can match patterns using regex (e.g., ^React for words starting with "React").

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        baseQuery.owner = userId
    }
    //baseQuerry actually making object for which i can directlty put in match to find video according to querry and 
    //owner id and store it as document .
    const sortOptions = {}
    if (sortBy) {
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1
    }
    //// Method 1: Direct property name (dot notation)
    // const obj = {}
    // obj.name = "John"

    // // Method 2: Square bracket notation (dynamic)
    // const obj = {}
    // const propertyName = "name"
    // obj[propertyName] = "John"

    const videos = await Video.aggregatePaginate([
        {
            $match: baseQuery
        },
        {
            $sort: sortOptions
        },
        {
            //to get owner info of the video that match in uppar satemnet
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    ], options)

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    if (!req.files?.videoFile) {
        throw new ApiError(400, "Video file is required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = thumbnailLocalPath ? await uploadOnCloudinary(thumbnailLocalPath) : ""

    if (!videoFile) {
        throw new ApiError(400, "Video file upload failed")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail?.url || "",
        duration: videoFile.duration,
        owner: req.user._id,
        isPublished: true
    })

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"))

})

// ✅ Use .populate() when you just need related documents as they are, like fetching the owner's details.
// ✅ Use Aggregation ($lookup) if you need custom transformations (like filtering, sorting, or joining multiple collections).
// two method

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId).populate("owner", "fullName username avatar")
    if(video.isPublished==false&&(video.owner.toString() !== req.user._id.toString()) ){
        throw new ApiError(400, "video is private");
    }

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})
//using aggreate-pipeline
{
    // const getVideoById = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(videoId)) {
//         throw new ApiError(400, "Invalid video ID");
//     }

//     const video = await Video.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(videoId) // Convert videoId to ObjectId
//             }
//         },
//         {
//             $lookup: {
//                 from: "users", // Collection name should be lowercase in MongoDB
//                 localField: "owner",
//                 foreignField: "_id",
//                 as: "owner",
//                 pipeline: [
//                     {
//                         $project: {
//                             fullName: 1,
//                             username: 1,
//                             avatar: 1
//                         }
//                     }
//                 ]
//             }
//         },
//         {
//             $addFields: {
//                 owner: { $first: "$owner" } // Extract the first (and only) owner object
//             }
//         }
//     ]);

//     if (!video || video.length === 0) {
//         throw new ApiError(404, "Video does not exist");
//     }

//     return res.status(200).json(
//         new ApiResponse(200, video[0], "Video fetched successfully")
//     );
// });
}


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    if (!title && !description && !req.files?.thumbnail) {
        throw new ApiError(400, "Please provide at least one field to update")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video")
    }

    if (req.files?.thumbnail) {
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        
        if (thumbnail) {
            video.thumbnail = thumbnail.url
        }
    }

    if (title) video.title = title
    if (description) video.description = description

    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"))
})
    
   

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to toggle video status")
    }

    video.isPublished = !video.isPublished

    await video.save({validateBeforeSave: false});

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                video,
                `Video ${video.isPublished ? "published" : "unpublished"} successfully`
            )
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
