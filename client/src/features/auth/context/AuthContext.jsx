import { createContext, useContext, useState } from "react";
import { loginRequest, registerRequest } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null,
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  const isLoggedIn = !!user;

  const login = async (email, password) => {
    const { user, token } = await loginRequest(email, password);
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
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

  // ✅ logout gốc — chỉ xóa auth, KHÔNG đụng player
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
