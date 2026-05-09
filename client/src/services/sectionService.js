import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const getSections = async () => {
  const res = await axios.get(`${API_URL}/sections`);
  return res.data.data;
};