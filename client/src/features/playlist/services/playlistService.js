import api from "../../../shared/services/api";

export const getMyPlaylists = () => api.get("/playlists");
export const createPlaylist = (name) => api.post("/playlists", { name });
export const addSongToPlaylist = (playlistId, songId) =>
  api.post(`/playlists/${playlistId}/songs`, { songId });
export const removeSongFromPlaylist = (playlistId, songId) =>
  api.delete(`/playlists/${playlistId}/songs/${songId}`);
export const deletePlaylist = (playlistId) =>
  api.delete(`/playlists/${playlistId}`);
export const getPlaylistById = (playlistId) =>
  api.get(`/playlists/${playlistId}`);