// client/src/shared/services/artist.service.js
import axios from "axios";
import { API_URL } from "../constants/api";

const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
const optionalAuthConfig = () => {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const artistService = {
  getAll: () => axios.get(`${API_URL}/artists`),
  getById: (id) => axios.get(`${API_URL}/artists/${id}`, optionalAuthConfig()),

  toggleFollow: (id) =>
    axios.post(
      `${API_URL}/artists/${id}/follow`,
      {},
      { headers: authHeader() },
    ),
  getFollowing: () =>
    axios.get(`${API_URL}/users/me/following`, {
      headers: authHeader(),
    }),

  delete: (id) =>
    axios.delete(`${API_URL}/artists/${id}`, { headers: authHeader() }),

  create: (formData) =>
    axios.post(`${API_URL}/artists`, formData, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    }),

  update: (id, formData) =>
    axios.put(`${API_URL}/artists/${id}`, formData, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    }),

  addAlbum: (artistId, formData) =>
    axios.post(`${API_URL}/artists/${artistId}/albums`, formData, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    }),

  deleteAlbum: (artistId, albumId) =>
    axios.delete(`${API_URL}/artists/${artistId}/albums/${albumId}`, {
      headers: authHeader(),
    }),

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
