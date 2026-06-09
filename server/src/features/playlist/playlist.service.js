import Playlist from "./playlist.model.js";

export const getUserPlaylists = async (userId) => {
  return Playlist.find({ owner: userId }).populate("songs", "title artist imageUrl audioUrl");
};

export const createPlaylist = async (userId, name) => {
  return Playlist.create({ owner: userId, name });
};

export const addSongToPlaylist = async (playlistId, songId, userId) => {
  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
  if (!playlist) throw new Error("Playlist not found");
  if (!playlist.songs.includes(songId)) {
    playlist.songs.push(songId);
    await playlist.save();
  }
  return playlist;
};

export const removeSongFromPlaylist = async (playlistId, songId, userId) => {
  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
  if (!playlist) throw new Error("Playlist not found");
  playlist.songs = playlist.songs.filter((s) => s.toString() !== songId);
  await playlist.save();
  return playlist;
};

export const deletePlaylist = async (playlistId, userId) => {
  return Playlist.findOneAndDelete({ _id: playlistId, owner: userId });
};

export const getPlaylistById = async (playlistId, userId) => {
  return Playlist.findOne({ _id: playlistId, owner: userId }).populate(
    "songs",
    "title artist imageUrl audioUrl duration"
  );
};