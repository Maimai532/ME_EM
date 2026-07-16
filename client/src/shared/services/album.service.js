import api from "./api";

export const albumService = {
  update: (albumId, data) => api.patch(`/albums/${albumId}`, data),
};