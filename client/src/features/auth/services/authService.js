import axios from "axios";
import { API_URL } from "../../../shared/constants/api";

export async function loginRequest(email, password) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
}

export async function registerRequest(username, email, password) {
  const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
  return res.data;
}
