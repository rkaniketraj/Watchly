import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    
    // Check if channel (user) exists
    const channel = await User.findById(channelId)
    if(!channel) {
        throw new ApiError(404, "Channel not found")
    }
    
    // User cannot subscribe to their own channel
    if(channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }
    
    // Find existing subscription
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })
    
    if(existingSubscription) {
        // Unsubscribe - Remove the subscription
        await Subscription.findByIdAndDelete(existingSubscription._id)
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        subscribed: false
                    },
                    "Unsubscribed successfully"
                )
            )
    } else {
        // Subscribe - Create new subscription
        const subscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        subscribed: true
                    },
                    "Subscribed successfully"
                )
            )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {page = 1, limit = 10} = req.query
    
    // Validate channelId
    if(!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    
    // Check if channel (user) exists
    const channel = await User.findById(channelId)
    if(!channel) {
        throw new ApiError(404, "Channel not found")
    }
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    
    // Get subscribers with pagination
    const subscribersList = await Subscription.aggregatePaginate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriber: { $first: "$subscriber" }
            }
        },
        {
            $project: {
                subscriber: 1
            }
        },
        {
            $sort: { createdAt: -1 }  // Most recent subscribers first
        }
    ], options)
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribersList,
                "Channel subscribers fetched successfully"
            )
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    const {page = 1, limit = 10} = req.query
    
    // Validate channelId
    if(!subscriberId || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }
    
    // Check if subscriber (user) exists
    const subscriber = await User.findById(subscriberId)
    if(!subscriber) {
        throw new ApiError(404, "Channel not found")
    }
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    
    // Get subscribers with pagination
    const subscribedChannelList = await Subscription.aggregatePaginate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelList",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                channelList: { $first: "$channelList" }
            }
        },
        {
            $project: {
                channelList: 1
            }
        },
        {
            $sort: { createdAt: -1 }  // Most recent subscribers first
        }
    ], options)
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannelList,
                "channelList fetched successfully"
            )
        )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}