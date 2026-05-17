import api from "./api";

const BASE = "/history";

export const addToHistory = (songId) =>
  api.post(BASE, { songId });

export const getHistory = (filter = "30days") =>
  api.get(BASE, { params: { filter } });

export const deleteHistory = (type = "all") =>
  api.delete(BASE, { params: { type } });