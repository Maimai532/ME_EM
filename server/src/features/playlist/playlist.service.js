
import Playlist from "./playlist.model.js";
import { resolveAlbumCover } from "../song/song.controller.js";
import User from "../../shared/models/User.js";

export const getUserPlaylists = async (userId) => {
  const playlists = await Playlist.find({ owner: userId }).populate(
    "songs",
    "title artist imageUrl audioUrl albumId",
  );
  return Promise.all(
    playlists.map(async (pl) => {
      const songsWithCover = await Promise.all(
        pl.songs.map(async (song) => {
          const coverUrl = await resolveAlbumCover(song);
          return { ...song.toObject(), coverUrl };
        }),
      );
      const plObj = pl.toObject();
      plObj.songs = songsWithCover;
      return plObj;
    }),
  );
};

export const getPlaylistById = async (playlistId, userId) => {
  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: userId,
  }).populate("songs", "title artist imageUrl audioUrl duration albumId");

  if (!playlist) return null;

  const songsWithCover = await Promise.all(
    playlist.songs.map(async (song) => {
      const coverUrl = await resolveAlbumCover(song);
      return { ...song.toObject(), coverUrl };
    }),
  );

  const playlistObj = playlist.toObject();
  playlistObj.songs = songsWithCover;
  return playlistObj;
};

export const createPlaylist = async (userId, name) => {
  const playlist = await Playlist.create({
    name,
    owner: userId,
    songs: [],
  });

  await User.findByIdAndUpdate(userId, {
    $push: { playlists: playlist._id },
  });

  return playlist.toObject();
};

export const addSongToPlaylist = async (playlistId, songId, userId) => {
  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
  if (!playlist) {
    const err = new Error("Không tìm thấy playlist");
    err.statusCode = 404;
    throw err;
  }

  if (!playlist.songs.includes(songId)) {
    playlist.songs.push(songId);
    await playlist.save();
  }

  return getPlaylistById(playlistId, userId);
};

export const removeSongFromPlaylist = async (playlistId, songId, userId) => {
  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
  if (!playlist) {
    const err = new Error("Không tìm thấy playlist");
    err.statusCode = 404;
    throw err;
  }

  playlist.songs = playlist.songs.filter((s) => s.toString() !== songId);
  await playlist.save();

  return getPlaylistById(playlistId, userId);
};

export const deletePlaylist = async (playlistId, userId) => {
  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: userId,
  });
  if (!playlist) {
    const err = new Error("Không tìm thấy playlist");
    err.statusCode = 404;
    throw err;
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { playlists: playlistId },
  });

  return true;
};