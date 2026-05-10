import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";

const API_URL = "http://localhost:8080/api";

const styles = {
  page:       { display: "flex", flexDirection: "column", gap: "20px" },
  heading:    { fontSize: "22px", fontWeight: "700", color: "#1e3a5f", margin: 0 },
  table:      { width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  th:         { padding: "12px 16px", textAlign: "left", backgroundColor: "#f1f5f9", fontSize: "13px", fontWeight: "600", color: "#475569" },
  td:         { padding: "12px 16px", fontSize: "14px", color: "#1e293b", borderTop: "1px solid #f1f5f9" },
  badge:      (role) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: role === "admin" ? "#dbeafe" : "#f0fdf4",
    color:           role === "admin" ? "#1d4ed8" : "#16a34a",
  }),
  actionBtn:  (color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    backgroundColor: color,
    color: "#fff",
    marginRight: "8px",
  }),
  error:      { color: "#ef4444", fontSize: "14px" },
};

function User_Admin() {
  useEffect(() => { document.title = "User Management"; }, []);

  const { token } = useAuth();
  console.log("token:", token);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Lấy danh sách users
  useEffect(() => {
    axios.get(`${API_URL}/users`, authHeader)
      .then(res => setUsers(res.data))
      .catch(() => setError("Không thể tải danh sách user"))
      .finally(() => setLoading(false));
  }, []);

  // Xoá user
  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xoá user này?")) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, authHeader);
      setUsers(users.filter(u => u._id !== id));
    } catch {
      alert("Xoá thất bại");
    }
  };

  // Đổi role
  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await axios.patch(`${API_URL}/users/${id}/role`, { role: newRole }, authHeader);
      setUsers(users.map(u => u._id === id ? res.data.user : u));
    } catch {
      alert("Đổi role thất bại");
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error)   return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Quản lý User</h1>
      <p style={{ color: "#64748b", margin: 0 }}>Tổng: {users.length} users</p>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Ngày tạo</th>
            <th style={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td style={styles.td}>{user.username}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>
                <span style={styles.badge(user.role)}>{user.role}</span>
              </td>
              <td style={styles.td}>
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td style={styles.td}>
                <button
                  style={styles.actionBtn(user.role === "admin" ? "#f59e0b" : "#2563eb")}
                  onClick={() => handleToggleRole(user._id, user.role)}
                >
                  {user.role === "admin" ? <><ShieldOff size={14} /> Hạ role</> : <><ShieldCheck size={14} /> Nâng Admin</>}
                </button>
                <button
                  style={styles.actionBtn("#ef4444")}
                  onClick={() => handleDelete(user._id)}
                >
                  <Trash2 size={14} /> Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default User_Admin;