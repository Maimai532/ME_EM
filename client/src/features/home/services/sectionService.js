import axios from "axios";
import { API_URL } from "../../../shared/constants/api";

export const getSections = async () => {
  const res = await axios.get(`${API_URL}/sections`)
  
  return res.data.data;
};
