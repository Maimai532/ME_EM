import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

export const artistService = {
  getAll: () => axios.get(`${API}/artists`),
  getById: (id) => axios.get(`${API}/artists/${id}`),

  delete: (id) =>
    axios.delete(`${API}/artists/${id}`, { headers: authHeader() }),

  // Album
  addAlbum: (artistId, formData) =>
    axios.post(`${API}/artists/${artistId}/albums`, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data", // ép đúng type
      },
    }),

  create: (formData) =>
    axios.post(`${API}/artists`, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, formData) =>
    axios.put(`${API}/artists/${id}`, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteAlbum: (artistId, albumId) =>
    axios.delete(`${API}/artists/${artistId}/albums/${albumId}`, {
      headers: authHeader(),
    }),

  // Songs
  addExistingSong: (artistId, songId, albumId) =>
    axios.post(
      `${API}/artists/${artistId}/songs`,
      { songId, albumId },
      { headers: authHeader() },
    ),

  createNewSong: (artistId, data) =>
    axios.post(`${API}/artists/${artistId}/songs/new`, data, {
      headers: authHeader(),
    }),

  removeSong: (artistId, songId) =>
    axios.delete(`${API}/artists/${artistId}/songs/${songId}`, {
      headers: authHeader(),
    }),
};
