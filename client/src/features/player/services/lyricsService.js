import axios from "axios";
import { API_URL } from "../../../shared/constants/api";

/**
 * Lấy lyrics của 1 bài hát từ backend
 * @param {string} songId
 * @returns {Promise<{ source: string, lyrics: Array<{time:number, text:string}>, message?: string }>}
 */
export async function getLyricsBySongId(songId) {
  if (!songId) throw new Error("songId là bắt buộc");

  const res = await axios.get(`${API_URL}/lyrics/${songId}`);
  return res.data;
}