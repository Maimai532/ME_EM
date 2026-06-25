import axios from "axios";
import { API_URL } from "../../../shared/constants/api";

export const fetchArtistById = async (id) => {
  const res = await axios.get(`${API_URL}/artists/${id}`);
  return res.data;
};