import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
    // Total videos
    const totalVideos = await Video.countDocuments({ owner: channelId });
    // Total views
    const videos = await Video.find({ owner: channelId });
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
    // Total likes on videos
    const videoIds = videos.map(v => v._id);
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });
    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalSubscribers,
            totalLikes
        }, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const videos = await Video.find({ owner: channelId })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});

export {
    getChannelStats, 
    getChannelVideos
    }