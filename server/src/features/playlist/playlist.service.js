import Playlist from "./playlist.model.js";
import { resolveAlbumCover } from "../song/song.controller.js"; // chỉnh path đúng theo cấu trúc thật

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