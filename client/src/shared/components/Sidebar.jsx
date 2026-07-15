import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/context/AuthContext";
import { usePlayer } from "../../features/player/context/PlayerContext";
import ConfirmModal from "./ConfirmModal";
import AvatarDefault from "./AvatarDefault";
import "./../styles/Sidebar.css";

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { stopPlayer } = usePlayer();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    stopPlayer();
    logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <aside className={`sidebar ${isOpen ? "" : "sidebar--closed"}`}>
      <div className="sidebar-brand">
        <img
          src="/logo2.png"
          alt="Logo"
          className="navbar-logo"
          onClick={() => setIsOpen?.(!isOpen)}
        />
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <img src="/home.png" alt="Home" className="sidebar__icon" />
          Home
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <img src="/library.png" alt="Library" className="sidebar__icon" />
          Library
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <img src="/history.png" alt="History" className="sidebar__icon" />
          History
        </NavLink>
      </nav>

      {isLoggedIn && (
        <div className="sidebar__footer">
          <div
            ref={userMenuRef}
            className={`sidebar__user-menu ${showUserMenu ? "sidebar__user-menu--open" : ""}`}
          >
            <button
              className="sidebar__avatar-btn"
              onClick={() => setShowUserMenu((v) => !v)}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="sidebar__avatar-img"
                />
              ) : (
                <AvatarDefault name={user?.username || "U"} size={40} />
              )}
            </button>

            {showUserMenu && (
              <div className="sidebar__dropdown">
                <div className="sidebar__dropdown-header">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="sidebar__avatar-img sidebar__avatar-img--lg"
                    />
                  ) : (
                    <AvatarDefault name={user?.username || "U"} size={45} />
                  )}
                  <div>
                    <p className="sidebar__dropdown-name">{user?.username}</p>
                    <p className="sidebar__dropdown-email">{user?.email}</p>
                  </div>
                </div>

                <div className="sidebar__dropdown-divider" />
                <Link
                  to="/profile"
                  className="sidebar__dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="sidebar__dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  Settings
                </Link>
                <div className="sidebar__dropdown-divider" />
                <button
                  className="sidebar__dropdown-item sidebar__dropdown-item--danger"
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowLogoutModal(true);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Đăng xuất ?"
        message="Bạn có chắc muốn đăng xuất không ?"
        cancel="Huỷ"
        confirm="Đăng xuất"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </aside>
  );
}

export default Sidebar;
