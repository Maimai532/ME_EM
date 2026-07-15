import api from "./api";

export const trackSongPlay = (songId) => {
  return api.post(`/songs/${songId}/play`);
};