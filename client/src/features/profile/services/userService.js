import axios from "axios";
import { API_URL } from "../../../shared/constants/api";

const getToken = () => localStorage.getItem("token");

export const getMe = async () => {
  const res = await axios.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data.data;
};

export const updateMe = async (formData) => {
  const res = await axios.patch(`${API_URL}/users/me`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data.data;
};
export const changePassword = async (oldPassword, newPassword) => {
  const res = await axios.patch(
    `${API_URL}/users/me/password`,
    { oldPassword, newPassword },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return res.data;
};