import axios from "axios";
import { API_URL } from "../../../shared/constants/api";

export const statsService = {
  getDashboard: (token, days = 7) =>
    axios.get(`${API_URL}/admin/stats/dashboard?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};