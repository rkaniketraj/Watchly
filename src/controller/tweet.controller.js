import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const owner = req.user?._id; // Extract user ID from request
    
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }
    
    if (!owner) {
        throw new ApiError(401, "Unauthorized request")
    }
    
    const tweet = await Tweet.create({
        content,
        owner,
    });
    
    const tweetInfo = await tweet.populate("owner", "fullName username avatar");
    
    return res.status(201).json(
        new ApiResponse(201, tweetInfo, "Tweet published successfully")
    );
});


const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query
    
    // Validate userId
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    // Get user tweets with pagination
    const tweets = await Tweet.aggregatePaginate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
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
        },
        {
            $sort: { createdAt: -1 }  // Sort by most recent first
        }
    ], options)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                tweets, 
                "User tweets fetched successfully"
            )
        )

})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { newtweet } = req.body;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!newtweet || newtweet.trim() === "") {
        throw new ApiError(400, "Provide the new tweet content");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized request to change tweet");
    }

    tweet.content = newtweet;
    await tweet.save({ validateBeforeSave: false });
    const updatedTweet = await Tweet.findById(tweetId).populate("owner", "fullName username avatar")

    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});


const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params;
    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized request to change tweet");
    }
    await Tweet.findByIdAndDelete(tweetId)
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {}, 
                "Tweet deleted successfully"
            )
        )

    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
