const rawBase = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const API_BASE = String(rawBase).replace(/\/$/, "");
export const API_URL = `${API_BASE}/api`;
