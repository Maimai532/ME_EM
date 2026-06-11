import { useEffect, useState, useRef } from "react";
import "../styles/Profile.css";
import { getMe, updateMe, changePassword } from "../services/userService";

const COLORS = [
  "#e74c3c",
  "#e67e22",
  "#f1c40f",
  "#2ecc71",
  "#1abc9c",
  "#3498db",
  "#9b59b6",
  "#e91e63",
];

function getColor(name) {
  const index = name.charCodeAt(0) % COLORS.length;
  return COLORS[index];
}

function AvatarDefault({ name, size = 200 }) {
  const bg = getColor(name);
  const letter = name.charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size, // ← dùng size
        height: size, // ← dùng size
        borderRadius: "50%",
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: "bold",
        color: "#fff",
        border: "3px solid #2e595f",
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
        setAvatarPreview(data.avatar || "");
      } catch (err) {
        console.error("Lỗi fetchUser:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, error]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleOpenModal = () => {
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setUsername(user.username);
    setEmail(user.email);
    setAvatarPreview(user.avatar || "");
    setAvatarFile(null);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
    setError("");
    setSuccess("");
    setShowModal(false);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Username không được để trống");
      return;
    }

    if (!email.trim()) {
      setError("Email không được để trống");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không đúng định dạng");
      return;
    }

    // Validate password nếu user muốn đổi
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword.trim()) {
        setError("Vui lòng nhập mật khẩu cũ");
        return;
      }
      if (!newPassword.trim()) {
        setError("Vui lòng nhập mật khẩu mới");
        return;
      }
      if (newPassword.length < 6) {
        setError("Mật khẩu mới phải ít nhất 6 ký tự");
        return;
      }
      if (!confirmPassword.trim()) {
        setError("Vui lòng xác nhận mật khẩu mới");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (avatarFile) formData.append("avatar", avatarFile);

      const updated = await updateMe(formData);

      const avatarUrl = updated.avatar
        ? `${updated.avatar}?t=${Date.now()}`
        : "";
      setUser({ ...updated, avatar: updated.avatar }); // user state giữ URL gốc
      setAvatarPreview(avatarUrl); 

      if (oldPassword && newPassword) {
        await changePassword(oldPassword, newPassword);
      }

      setSuccess("Cập nhật thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi server, thử lại sau");
    } finally {
      setLoading(false); 
    }
  };

  if (!user) return <p className="profile-loading">Đang tải...</p>;

  return (
    <div className="profile-page">
      <h2 className="profile-page__title">Thông tin cá nhân</h2>
      {/* {error && <p className="profile-page__error">{error}</p>} */}
      {success && <p className="profile-page__success">{success}</p>}
      <div className="profile-page__info">
        {console.log("avatar:", user.avatar)}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="profile-page__avatar"
          />
        ) : (
          <AvatarDefault name={user.username} size={150} />
        )}

        <div className="profile-page__details">
          <p className="profile-page__name">{user.username}</p>
          <p className="profile-page__email">{user.email}</p>
        </div>
        <button className="profile-page__edit-btn" onClick={handleOpenModal}>
          Edit
        </button>
      </div>

      {showModal && (
        <div className="profile-modal__overlay" onClick={handleCloseModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="profile-modal__title">Chỉnh sửa thông tin</h3>

            <div className="profile-modal__avatar-wrap">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="profile-modal__avatar"
                  onClick={() => fileInputRef.current.click()}
                />
              ) : (
                <div onClick={() => fileInputRef.current.click()}>
                  <AvatarDefault name={username} size={90} />
                </div>
              )}
              <p className="profile-modal__avatar-hint">
                Nhấn vào ảnh để thay đổi
              </p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="profile-modal__form">
              <label className="profile-modal__label">Username</label>
              <input
                className="profile-modal__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label className="profile-modal__label">Email</label>
              <input
                className="profile-modal__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="profile-modal__label">Mật khẩu cũ</label>
              <div className="profile-modal__input-wrap">
                <input
                  className="profile-modal__input"
                  type={showOld ? "text" : "password"}
                  placeholder="Để trống nếu không đổi"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="profile-modal__eye"
                  onClick={() => setShowOld(!showOld)}
                >
                  {showOld ? "🙈" : "👁️"}
                </button>
              </div>

              <label className="profile-modal__label">Mật khẩu mới</label>
              <div className="profile-modal__input-wrap">
                <input
                  className="profile-modal__input"
                  type={showNew ? "text" : "password"}
                  placeholder="Ít nhất 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="profile-modal__eye"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>

              <label className="profile-modal__label">
                Xác nhận mật khẩu mới
              </label>
              <div className="profile-modal__input-wrap">
                <input
                  className="profile-modal__input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="profile-modal__eye"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>

              {error && <p className="profile-modal__error">{error}</p>}
              {/*{success && <p className="profile-modal__success">{success}</p>} */}

              <div className="profile-modal__actions">
                <button
                  className="profile-modal__cancel"
                  onClick={handleCloseModal}
                >
                  Huỷ
                </button>
                <button
                  className="profile-modal__save"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
