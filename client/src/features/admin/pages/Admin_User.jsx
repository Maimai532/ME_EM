import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import {
  Edit3,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/hooks/useToast";
import { API_URL } from "../../../shared/constants/api";
import AdminPage from "./Admin_Page";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/Admin_User.css";

const emptyForm = {
  username: "",
  email: "",
  password: "",
  role: "user",
  avatar: "",
};

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("vi-VN");
}

function UserForm({ user, token, onSaved, onCancel }) {
  const isEdit = !!user?._id;
  const { showToast } = useToast();
  const [form, setForm] = useState({ ...emptyForm, ...(user || {}) });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.username.trim() || !form.email.trim()) {
      showToast("Username và email không được để trống", "warning");
      return;
    }

    if (!isEdit && form.password.trim().length < 6) {
      showToast("Mật khẩu phải ít nhất 6 ký tự", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        avatar: form.avatar?.trim() || "",
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = isEdit
        ? await axios.patch(`${API_URL}/users/${user._id}`, payload, config)
        : await axios.post(`${API_URL}/users`, payload, config);

      onSaved(res.data.user);
      showToast(isEdit ? "Đã cập nhật user" : "Đã tạo user", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Lưu user thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="user-admin__detail-form">
      <div className="user-admin__detail-title">
        {isEdit ? "Sửa user" : "Thêm user"}
      </div>

      <form className="user-admin-form" onSubmit={handleSubmit}>
        <div className="user-admin-form__avatar-row">
          <div className="user-admin-form__avatar-fields">
            <label className="user-admin__label">
              Avatar URL
              <input
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                placeholder="https://..."
                className="user-admin__input"
              />
            </label>
          </div>
          {form.avatar ? (
            <img
              src={form.avatar}
              alt={form.username || "avatar"}
              className="user-admin-form__avatar"
              onError={() => setForm((prev) => ({ ...prev, avatar: "" }))}
            />
          ) : (
            <div className="user-admin-form__avatar user-admin-form__avatar--empty">
              <User size={38} />
            </div>
          )}
        </div>

        <label className="user-admin__label">
          Username *
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="user-admin__input"
          />
        </label>

        <label className="user-admin__label">
          Email *
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="user-admin__input"
          />
        </label>

        <label className="user-admin__label">
          Role
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="user-admin__input"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label className="user-admin__label">
          {isEdit ? "Mật khẩu mới" : "Mật khẩu *"}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required={!isEdit}
            minLength={form.password ? 6 : undefined}
            placeholder={isEdit ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"}
            className="user-admin__input"
          />
        </label>

        <div className="user-admin-form__actions">
          <button type="button" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo user"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EmptyUserPanel() {
  return (
    <div className="user-admin__detail-empty">
      <div className="user-admin__detail-empty-icon">
        <User size={34} />
      </div>
      <span>Chọn user để xem chi tiết hoặc tạo user mới.</span>
    </div>
  );
}

function Admin_User() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const tableRef = useRef(null);
  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    document.title = "User Management";
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`, authHeader);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("Không thể tải danh sách user", "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authHeader, showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const keyword = search.trim().toLowerCase();
    const matchSearch =
      !keyword ||
      user.username?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword);
    const matchRole = !roleFilter || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const sortedUsers = [...filteredUsers].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );

  const PAGE_SIZE = 30;
  const totalPages = Math.ceil(sortedUsers.length / PAGE_SIZE);
  const pagedUsers = sortedUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const visibleUserIds = pagedUsers.map((user) => user._id);
  const allVisibleSelected =
    visibleUserIds.length > 0 &&
    visibleUserIds.every((id) => selectedIds.includes(id));

  function upsertUser(savedUser) {
    if (!savedUser?._id) return;
    setUsers((prev) => {
      const exists = prev.some((user) => user._id === savedUser._id);
      return exists
        ? prev.map((user) => (user._id === savedUser._id ? savedUser : user))
        : [savedUser, ...prev];
    });
    setActiveUser(savedUser);
    setCreatingNew(false);
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleUserIds.includes(id))
        : [...new Set([...prev, ...visibleUserIds])],
    );
  }

  function handleNewUser() {
    setActiveUser(null);
    setCreatingNew(true);
  }

  function handleDelete(id) {
    setConfirm({
      message: "Xác nhận xoá user này?",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/users/${id}`, authHeader);
          setUsers((prev) => prev.filter((user) => user._id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
          if (activeUser?._id === id) setActiveUser(null);
          showToast("Đã xoá user", "success");
        } catch {
          showToast("Xoá user thất bại", "error");
        } finally {
          setConfirm(null);
        }
      },
    });
  }

  function handleDeleteSelected() {
    const count = selectedIds.length;
    setConfirm({
      message: `Xoá ${count} user?`,
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedIds.map((id) =>
              axios.delete(`${API_URL}/users/${id}`, authHeader),
            ),
          );
          setUsers((prev) =>
            prev.filter((user) => !selectedIds.includes(user._id)),
          );
          if (selectedIds.includes(activeUser?._id)) setActiveUser(null);
          setSelectedIds([]);
          showToast(`Đã xoá ${count} user`, "success");
        } catch {
          showToast("Xoá user thất bại", "error");
        } finally {
          setConfirm(null);
        }
      },
    });
  }

  async function handleToggleRole(user) {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await axios.patch(
        `${API_URL}/users/${user._id}/role`,
        { role: newRole },
        authHeader,
      );
      upsertUser(res.data.user);
      showToast("Đã cập nhật role", "success");
    } catch {
      showToast("Đổi role thất bại", "error");
    }
  }

  const headerActions = (
    <>
      {selectedIds.length > 0 && (
        <button
          type="button"
          className="user-admin-btn user-admin-btn--danger"
          onClick={handleDeleteSelected}
        >
          Delete ({selectedIds.length})
        </button>
      )}
      <button
        type="button"
        className="user-admin-btn"
        onClick={handleNewUser}
      >
        <Plus size={15} /> New User
      </button>
    </>
  );

  return (
    <AdminPage title="Quản lý User" actions={headerActions}>
      <div className="user-admin__layout">
        <div className="user-admin__left">
          <div className="user-admin__filter-bar">
            <div className="user-admin__search-wrap">
              <input
                type="text"
                placeholder="Tìm username / email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                  setSelectedIds([]);
                }}
                className="user-admin__search-input"
              />
              {search && (
                <button
                  type="button"
                  className="user-admin__search-clear"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
              className="user-admin__role-filter"
            >
              <option value="">Tất cả role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <button
              type="button"
              className="user-admin__refresh"
              onClick={fetchUsers}
              title="Làm mới"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {creatingNew || activeUser ? (
            <UserForm
              key={activeUser?._id || "new-user"}
              user={creatingNew ? null : activeUser}
              token={token}
              onSaved={upsertUser}
              onCancel={() => {
                setCreatingNew(false);
                setActiveUser(null);
              }}
            />
          ) : (
            <EmptyUserPanel />
          )}
        </div>

        <div className="user-admin__right">
          {loading ? (
            <p className="user-admin__loading">Đang tải...</p>
          ) : (
            <>
              <div className="user-admin__table-shell">
                <div className="user-admin__table-wrapper" ref={tableRef}>
                  <table className="user-admin-table">
                    <colgroup>
                      <col className="user-admin__col-select" />
                      <col className="user-admin__col-user" />
                      <col className="user-admin__col-role" />
                      <col className="user-admin__col-date" />
                      <col className="user-admin__col-actions" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="user-admin-th">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="user-admin-th">User</th>
                        <th className="user-admin-th">Role</th>
                        <th className="user-admin-th">Ngày tạo</th>
                        <th className="user-admin-th">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.length > 0 ? (
                        pagedUsers.map((user) => (
                          <tr
                            key={user._id}
                            className={[
                              "user-admin-row",
                              selectedIds.includes(user._id)
                                ? "user-admin-row--selected"
                                : "",
                              activeUser?._id === user._id
                                ? "user-admin-row--active"
                                : "",
                            ].join(" ")}
                            onClick={() => {
                              setCreatingNew(false);
                              setActiveUser(user);
                            }}
                          >
                            <td
                              className="user-admin-td"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(user._id)}
                                onChange={() => toggleSelect(user._id)}
                              />
                            </td>
                            <td className="user-admin-td user-admin-td--user">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.username}
                                  className="user-admin-avatar"
                                />
                              ) : (
                                <div className="user-admin-avatar user-admin-avatar--empty">
                                  <User size={17} />
                                </div>
                              )}
                              <div className="user-admin-user-text">
                                <strong>{user.username}</strong>
                                <span>
                                  <Mail size={12} /> {user.email}
                                </span>
                              </div>
                            </td>
                            <td className="user-admin-td">
                              <span
                                className={`user-admin-badge ${
                                  user.role === "admin"
                                    ? "user-admin-badge--admin"
                                    : "user-admin-badge--user"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="user-admin-td">
                              {formatDate(user.createdAt)}
                            </td>
                            <td
                              className="user-admin-td"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="user-admin-action user-admin-action--edit"
                                onClick={() => {
                                  setCreatingNew(false);
                                  setActiveUser(user);
                                }}
                                title="Sửa user"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                className={`user-admin-action ${
                                  user.role === "admin"
                                    ? "user-admin-action--toggle-admin"
                                    : "user-admin-action--promote"
                                }`}
                                onClick={() => handleToggleRole(user)}
                                title={
                                  user.role === "admin"
                                    ? "Hạ xuống user"
                                    : "Nâng lên admin"
                                }
                              >
                                {user.role === "admin" ? (
                                  <ShieldOff size={14} />
                                ) : (
                                  <ShieldCheck size={14} />
                                )}
                              </button>
                              <button
                                type="button"
                                className="user-admin-action user-admin-action--delete"
                                onClick={() => handleDelete(user._id)}
                                title="Xoá user"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="user-admin-empty">
                            {search
                              ? `Không tìm thấy user "${search}".`
                              : "Chưa có user."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage(1)}>
                    ««
                  </button>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    ‹
                  </button>
                  <span className="pagination__info">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    ›
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(totalPages)}
                  >
                    »»
                  </button>
                </div>
              )}
            </>
          )}
        </div>
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
