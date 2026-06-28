import axios from "axios";
import { API_URL } from "../../../shared/constants/api";

/* 
axios.get(...): gửi req HTTP GET lên server
GET: chỉ lấy dl, k thay đổi j
${API_URL}: có gtrị như http://localhost:5000/api

/songs/search: route vừa tạo ở BE, Ghép lại thành: http://localhost:5000/api/songs/search

*/


export async function getSongById(id) {
  const res = await axios.get(`${API_URL}/songs/${id}`);
  return res.data.data || res.data; 
}

export async function getRandomSongs(limit = 20) {
  try {
    const res = await axios.get(`${API_URL}/songs/random?limit=${limit}`);
    const songs = res.data.data || res.data;
    return Array.isArray(songs)
      ? [...new Map(songs.map((s) => [s._id, s])).values()]
      : [];
  } catch {
    const res = await axios.get(`${API_URL}/songs?limit=100`);
    const songs = res.data.data || res.data;
    return Array.isArray(songs)
      ? [...new Map(songs.map((s) => [s._id, s])).values()]
          .sort(() => Math.random() - 0.5)
          .slice(0, limit)
      : [];
  }
}

export const searchSongs = async (query) => {
  const res = await axios.get(`${API_URL}/songs/search?q=${query}`);
  return res.data.data;
};
export const songService = {
  getAll: async () => {
    const res = await axios.get(`${API_URL}/songs`);
    return { data: res.data.data || res.data };
  },
};
export async function getAllSongs() {
  const res = await axios.get(`${API_URL}/songs`);
  return res.data.data || res.data;
}

/*
?q=${query}: 
?: bắt đầu query string
q=. Tên tham số, BE đọc = req.query.q
${query}: keyword
*/