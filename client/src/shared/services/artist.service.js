import axios from "axios";
import { API_URL } from "../../shared/constants/api";

const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

export const artistService = {
  getAll: () => axios.get(`${API_URL}/artists`),
  getById: (id) => axios.get(`${API_URL}/artists/${id}`),

  delete: (id) =>
    axios.delete(`${API_URL}/artists/${id}`, { headers: authHeader() }),

  // Album
  addAlbum: (artistId, formData) =>
    axios.post(`${API_URL}/artists/${artistId}/albums`, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data", 
      },
    }),

  create: (formData) =>
    axios.post(`${API_URL}/artists`, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, formData) =>
    axios.put(`${API_URL}/artists/${id}`, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteAlbum: (artistId, albumId) =>
    axios.delete(`${API_URL}/artists/${artistId}/albums/${albumId}`, {
      headers: authHeader(),
    }),

  // Songs
  addExistingSong: (artistId, songId, albumId) =>
    axios.post(
      `${API_URL}/artists/${artistId}/songs`,
      { songId, albumId },
      { headers: authHeader() },
    ),

  createNewSong: (artistId, data) =>
    axios.post(`${API_URL}/artists/${artistId}/songs/new`, data, {
      headers: authHeader(),
    }),

  removeSong: (artistId, songId) =>
    axios.delete(`${API_URL}/artists/${artistId}/songs/${songId}`, {
      headers: authHeader(),
    }),
};
