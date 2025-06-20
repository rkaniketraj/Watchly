import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
   
        
    // Validate required fields
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }
    
    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required")
    }
    
    // Create the playlist with the user ID from the request
    const playlist = await Playlist.create({
        name,
        description,
        videos: [], // Initialize with empty array
        owner: req.user._id  // Assuming authenticated user's ID is available in req.user._id
    })
    
    // Return the created playlist
    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    )


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const playlists = await Playlist.find({ owner: userId }).populate("videos");
    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId).populate("videos");
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(409, "Video already in playlist");
    }
    playlist.videos.push(videoId);
    await playlist.save();
    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }
    const videoIndex = playlist.videos.indexOf(videoId);
    if (videoIndex === -1) {
        throw new ApiError(404, "Video not found in playlist");
    }
    playlist.videos.splice(videoIndex, 1);
    await playlist.save();
    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }
    await Playlist.findByIdAndDelete(playlistId);
    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }
    if (name) playlist.name = name;
    if (description) playlist.description = description;
    await playlist.save();
    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
