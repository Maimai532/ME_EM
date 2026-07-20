import api from "./api";

export const albumService = {
  getById: (id) => api.get(`/albums/${id}`),
  update: (albumId, data) => api.patch(`/albums/${albumId}`, data),
};