import { createContext, useContext, useState } from "react";
import { loginRequest, registerRequest } from "../services/authService";
import api from "../../../shared/services/api";

const AuthContext = createContext(null);

// API calls cho liked songs
const getLikedSongs = () => api.get("/users/liked-songs");
const toggleLikeSong = (songId) => api.post(`/users/liked-songs/${songId}`);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null,
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );
  const [likedSongs, setLikedSongs] = useState([]);

  const isLoggedIn = !!user;

  const fetchLikedSongs = async () => {
    try {
      const res = await getLikedSongs();
      setLikedSongs(res.data?.data ?? res.data ?? []);
    } catch {
      setLikedSongs([]);
    }
  };

  const toggleLike = async (songId) => {
    await toggleLikeSong(songId);
    setLikedSongs((prev) =>
      prev.some((s) => s._id === songId)
        ? prev.filter((s) => s._id !== songId)
        : [...prev, { _id: songId }],
    );
  };

  const login = async (email, password) => {
    const { user, token } = await loginRequest(email, password);
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    await fetchLikedSongs(); // ← fetch sau khi login
    return user;
  };

  const register = async (username, email, password) => {
    const { user, token } = await registerRequest(username, email, password);
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    return user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLikedSongs([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user, token, isLoggedIn,
        login, register, logout,
        likedSongs, toggleLike, fetchLikedSongs, // ← expose ra
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };