import { useEffect, useState, useRef } from "react";
import "../styles/Profile.css";
import { getMe, updateMe, changePassword } from "../services/userService";
import AvatarDefault from "../../../shared/components/AvatarDefault";

const COLORS = [
  "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71",
  "#1abc9c", "#3498db", "#9b59b6", "#e91e63",
];

function getColor(name) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

// function AvatarDefault({ name, size = 88 }) {
//   return (
//     <div
//       style={{
//         width: size, height: size, borderRadius: "50%",
//         backgroundColor: getColor(name),
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: size * 0.4, fontWeight: "500", color: "#fff",
//         border: "2.5px solid #2e595f", flexShrink: 0,
//       }}
//     >
//       {name.charAt(0).toUpperCase()}
//     </div>
//   );
// }

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`profile-toast ${type === "error" ? "profile-toast--error" : "profile-toast--success"}`}>
      {message}
    </div>
  );
}

function ConfirmModal({ open, changes, onCancel, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div className="profile-modal__overlay" onClick={onCancel}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="profile-modal__title">Save changes?</h3>
        <p className="profile-modal__subtitle">The following will be updated:</p>
        <div className="profile-modal__change-list">
          {changes.map((c, i) => (
            <span key={i} className="profile-modal__change-item">• {c}</span>
          ))}
        </div>
        <div className="profile-modal__actions">
          <button className="profile-modal__cancel" onClick={onCancel}>Cancel</button>
          <button className="profile-modal__save" onClick={onConfirm} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef(null);

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
    if (!toast.message) return;
    const t = setTimeout(() => setToast({ message: "", type: "" }), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const isDirty = () => {
    if (!user) return false;
    if (username.trim() !== user.username) return true;
    if (email.trim() !== user.email) return true;
    if (avatarFile) return true;
    if (oldPassword || newPassword || confirmPassword) return true;
    return false;
  };

  const getChangeSummary = () => {
    const list = [];
    if (!user) return list;
    if (username.trim() !== user.username)
      list.push(`Username: ${user.username} → ${username.trim()}`);
    if (email.trim() !== user.email)
      list.push(`Email: ${user.email} → ${email.trim()}`);
    if (avatarFile) list.push("Profile photo updated");
    if (oldPassword || newPassword) list.push("Password changed");
    return list;
  };

  const validate = () => {
    if (!username.trim()) {
      setToast({ message: "Username cannot be empty", type: "error" });
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setToast({ message: "Enter a valid email address", type: "error" });
      return false;
    }
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword.trim()) {
        setToast({ message: "Enter your current password", type: "error" });
        return false;
      }
      if (newPassword.length < 6) {
        setToast({ message: "New password must be at least 6 characters", type: "error" });
        return false;
      }
      if (newPassword !== confirmPassword) {
        setToast({ message: "Passwords don't match", type: "error" });
        return false;
      }
    }
    return true;
  };

  const handleSaveClick = () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (avatarFile) formData.append("avatar", avatarFile);

      const updated = await updateMe(formData);

      if (oldPassword && newPassword) {
        await changePassword(oldPassword, newPassword);
      }

      setUser(updated);
      setAvatarPreview(updated.avatar ? `${updated.avatar}?t=${Date.now()}` : "");
      setAvatarFile(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowConfirmModal(false);
      setToast({ message: "Changes saved", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Server error, please try again", type: "error" });
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  if (!user) return <p className="profile-loading">Loading…</p>;

  const dirty = isDirty();

  return (
    <div className="profile-page">
      <Toast message={toast.message} type={toast.type} />

      <div className="profile-page__header">
        <h2 className="profile-page__title">Profile</h2>
        <div className="profile-page__save-bar">
          {dirty && <span className="profile-page__unsaved">Unsaved changes</span>}
          <button
            className="profile-page__save-btn"
            disabled={!dirty}
            onClick={handleSaveClick}
          >
            Save changes
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card__top">
          <div
            className="profile-avatar-wrap"
            onClick={() => fileInputRef.current.click()}
            title="Change photo"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="profile-avatar-img" />
            ) : (
              <AvatarDefault name={username || "?"} size={88} />
            )}
            <div className="profile-avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          <input
            type="file" accept="image/*"
            ref={fileInputRef} style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <div className="profile-card__preview">
            <p className="profile-card__preview-name">{username || "—"}</p>
            <p className="profile-card__preview-email">{email || "—"}</p>
            <p className="profile-card__avatar-hint">Click the avatar to change photo</p>
          </div>
        </div>

        {/* Fields */}
        <div className="profile-card__body">
          <p className="profile-section-label">Account</p>

          <div className="profile-field">
            <label className="profile-field__label" htmlFor="fUsername">Username</label>
            <input
              id="fUsername"
              className={`profile-field__input${username.trim() !== user.username ? " profile-field__input--changed" : ""}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label className="profile-field__label" htmlFor="fEmail">Email</label>
            <input
              id="fEmail"
              type="email"
              className={`profile-field__input${email.trim() !== user.email ? " profile-field__input--changed" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <p className="profile-section-label" style={{ marginTop: 8 }}>Change password</p>

          <div className="profile-field">
            <label className="profile-field__label" htmlFor="fOld">Current password</label>
            <div className="profile-field__pw-wrap">
              <input
                id="fOld"
                className="profile-field__input"
                type={showOld ? "text" : "password"}
                placeholder="Leave blank to keep"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button className="profile-field__eye" type="button" onClick={() => setShowOld(!showOld)}>
                {showOld ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-field__label" htmlFor="fNew">New password</label>
            <div className="profile-field__pw-wrap">
              <input
                id="fNew"
                className="profile-field__input"
                type={showNew ? "text" : "password"}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button className="profile-field__eye" type="button" onClick={() => setShowNew(!showNew)}>
                {showNew ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-field__label" htmlFor="fConfirm">Confirm password</label>
            <div className="profile-field__pw-wrap">
              <input
                id="fConfirm"
                className="profile-field__input"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button className="profile-field__eye" type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirmModal}
        changes={getChangeSummary()}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </div>
  );
}

export default Profile;