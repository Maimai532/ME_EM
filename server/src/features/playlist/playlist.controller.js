import asyncHandler from "../../shared/utils/asyncHandler.js";
import { sendSuccess, sendError } from "../../shared/utils/responseHandler.js";
import * as playlistService from "./playlist.service.js";

export const getMyPlaylists = asyncHandler(async (req, res) => {
  const playlists = await playlistService.getUserPlaylists(req.user._id);
  sendSuccess(res, playlists);
});

export const getPlaylistById = asyncHandler(async (req, res) => {
  const playlist = await playlistService.getPlaylistById(req.params.id, req.user._id);
  if (!playlist) return sendError(res, "Not found", 404);
  sendSuccess(res, playlist);
});

export const createPlaylist = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return sendError(res, "Name is required", 400);
  const playlist = await playlistService.createPlaylist(req.user._id, name);
  sendSuccess(res, playlist, 201);
});

export const addSong = asyncHandler(async (req, res) => {
  const playlist = await playlistService.addSongToPlaylist(
    req.params.id,
    req.body.songId,
    req.user._id
  );
  sendSuccess(res, playlist);
});

export const removeSong = asyncHandler(async (req, res) => {
  const playlist = await playlistService.removeSongFromPlaylist(
    req.params.id,
    req.params.songId,
    req.user._id
  );
  sendSuccess(res, playlist);
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  await playlistService.deletePlaylist(req.params.id, req.user._id);
  sendSuccess(res, { message: "Deleted" });
});