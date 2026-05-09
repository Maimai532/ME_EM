import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Chỉ cho vào nếu đã login
export function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Chỉ cho vào nếu là admin
export function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/home" replace />;
  return children;
}