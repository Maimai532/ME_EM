import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../auth/context/AuthContext";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";

import "../styles/Admin_User.css";
import AdminPage from "./Admin_Page";
import { useToast } from "../../../shared/hooks/useToast";
import ConfirmModal from "../components/ConfirmModal";
import { API_URL } from "../../../shared/constants/api";

function Admin_User() {
  useEffect(() => {
    document.title = "User Management";
  }, []);

  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useToast();
  const [confirm, setConfirm] = useState(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios
      .get(`${API_URL}/users`, authHeader)
      .then((res) => setUsers(res.data))
      .catch(() => setError("Không thể tải danh sách user"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    setConfirm({
      message: "Xác nhận xoá user này?",
      onConfirm: async () => {
        setConfirm(null);

        try {
          await axios.delete(`${API_URL}/users/${id}`, authHeader);

          setUsers((prev) => prev.filter((u) => u._id !== id));

          showToast("Đã xoá user", "success");
        } catch {
          showToast("Xoá user thất bại", "error");
        }
      },
    });
  };

  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await axios.patch(
        `${API_URL}/users/${id}/role`,
        { role: newRole },
        authHeader,
      );
      setUsers(users.map((u) => (u._id === id ? res.data.user : u)));
    } catch {
      showToast("Đổi role thất bại", "error");
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="user-admin-error">{error}</p>;

  return (
    <AdminPage title="Quản lý User">
      <div className="user-admin-meta">
        Users: <span>{users.length}</span>{" "}
      </div>

      <div className="user-admin__table-wrapper">
        <table className="user-admin-table">
          <thead>
            <tr>
              <th className="user-admin-th">Username</th>
              <th className="user-admin-th">Email</th>
              <th className="user-admin-th">Role</th>
              <th className="user-admin-th">Ngày tạo</th>
              <th className="user-admin-th">Edit role</th>
              <th className="user-admin-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="user-admin-td">{user.username}</td>
                <td className="user-admin-td">{user.email}</td>
                <td className="user-admin-td">
                  <span
                    className={`user-admin-badge ${user.role === "admin" ? "user-admin-badge--admin" : "user-admin-badge--user"}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="user-admin-td">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="user-admin-td">
                  <button
                    type="button"
                    className={`user-admin-action ${user.role === "admin" ? "user-admin-action--toggle-admin" : "user-admin-action--promote"}`}
                    onClick={() => handleToggleRole(user._id, user.role)}
                  >
                    {user.role === "admin" ? (
                      <>
                        <ShieldOff size={14} /> Hạ role
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} /> Nâng Admin
                      </>
                    )}
                  </button>
                </td>
                <td className="user-admin-td">
                  <button
                    type="button"
                    className="user-admin-action user-admin-action--delete"
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
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </AdminPage>
  );
}

export default Admin_User;
