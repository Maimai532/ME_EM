import axios from "axios";
import { API_URL } from "../../../shared/constants/api";

export async function getSongById(id) {
  const res = await axios.get(`${API_URL}/songs/${id}`);
  return res.data.data || res.data;
}

export async function getRandomSongs(limit = 20) {
  try {
    const res = await axios.get(`${API_URL}/songs/random?limit=${limit}`);
    return res.data.data || res.data;
  } catch {
    const res = await axios.get(`${API_URL}/songs?limit=100`);
    const songs = res.data.data || res.data;
    return Array.isArray(songs) ? songs.sort(() => Math.random() - 0.5).slice(0, limit) : [];
  }
}
