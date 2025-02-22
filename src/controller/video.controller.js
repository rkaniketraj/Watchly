import mongoose, {isValidObjectId} from "mongoose"
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
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
