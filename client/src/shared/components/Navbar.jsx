import { DownOutlined } from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, X, Search } from "lucide-react";

import { useAuth } from "../../features/auth/context/AuthContext";
import { usePlayer } from "../../features/player/context/PlayerContext";
import "./../styles/Navbar.css";
import { searchSongs } from "../../features/home/services/songService";
import ConfirmModal from "./ConfirmModal";
import AvatarDefault from "./AvatarDefault";

const HISTORY_KEY = "search_history";
const MAX_HISTORY = 3;

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToHistory(query) {
  if (!query.trim()) return;
  let history = getHistory();
  history = history.filter((q) => q.toLowerCase() !== query.toLowerCase());
  history.unshift(query.trim());
  history = history.slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function Navbar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { stopPlayer, playSong } = usePlayer();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState(getHistory());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const wrapperRef = useRef(null);
  const { isMusicPlayerVisible } = usePlayer();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const songs = await searchSongs(value);
    setResults(songs.slice(0, 5)); // giới hạn kq
    // setResults(songs);
    setSearching(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      saveToHistory(query);
      setHistory(getHistory());
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleHistoryClick = (item) => {
    saveToHistory(item);
    setHistory(getHistory());
    setQuery(item);
    setResults([]);
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(item)}`);
  };

  const handleRemoveHistory = (e, item) => {
    e.stopPropagation();
    const updated = getHistory().filter((h) => h !== item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  const handleLogout = () => {
    stopPlayer();
    logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  const userMenuItems = [
    { key: "1", label: <Link to="/profile">Profile</Link> },
    { key: "2", label: <Link to="/settings">Settings</Link> },
    {
      key: "3",
      label: <button onClick={() => setShowLogoutModal(true)}>Logout</button>,
    },
  ];

  const showHistory = history.length > 0;
  const showResults = results.length > 0;
  const isDropdownOpen = showDropdown && (showHistory || showResults);

  return (
    <nav
      className={`navbar ${isMusicPlayerVisible ? "navbar--player-open" : ""}`}
    >
      <div className="navbar-brand">
        <img
          src="/logo2.png"
          alt="Logo"
          className="navbar-logo"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      <div className="navbar-actions">
        <nav className="navbar-search" ref={wrapperRef}>
          <input
            type="search"
            placeholder="Search..."
            className="navbar-input"
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
          />

          {isDropdownOpen && (
            <div className="search-dropdown">
              {showHistory && (
                <div className="search-dropdown__section">
                  {history.map((item) => (
                    <div
                      key={item}
                      className="search-dropdown__history-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleHistoryClick(item)}
                    >
                      <Clock size={14} className="search-dropdown__clock" />
                      <span className="search-dropdown__history-text">
                        {item}
                      </span>
                      <button
                        className="search-dropdown__remove"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleRemoveHistory(e, item)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showHistory && showResults && (
                <div className="search-dropdown__divider" />
              )}

              {showResults && (
                <div className="search-dropdown__section">
                  <p className="search-dropdown__label">Kết quả</p>
                  {searching && (
                    <p className="search-dropdown__loading">Đang tìm...</p>
                  )}
                  {results.map((song) => (
                    <div
                      key={song._id}
                      className="search-dropdown__result-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        playSong(song, results);
                        setQuery("");
                        setResults([]);
                        setShowDropdown(false);
                      }}
                    >
                      <div>
                        <p className="search-dropdown__result-title">
                          {song.title}
                        </p>
                        <p className="search-dropdown__result-artist">
                          {song.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
        {isLoggedIn ? (
          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setShowUserMenu((v) => !v)}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="user-avatar-img"
                />
              ) : (
                <AvatarDefault name={user?.username || "U"} size={40} />
              )}
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown__header">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="user-avatar-img user-avatar-img--lg"
                    />
                  ) : (
                    <AvatarDefault name={user?.username || "U"} size={45} />
                  )}
                  <div>
                    <p className="user-dropdown__name">{user?.username}</p>
                    <p className="user-dropdown__email">{user?.email}</p>
                  </div>
                </div>

                <div className="user-dropdown__divider" />
                <Link
                  to="/profile"
                  className="user-dropdown__item"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="user-dropdown__item"
                  onClick={() => setShowUserMenu(false)}
                >
                  Settings
                </Link>
                <div className="user-dropdown__divider" />
                <button
                  className="user-dropdown__item user-dropdown__item--danger"
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
        ) : (
          <>
            {" "}
            <button
              className="navbar-btn navbar-btn-reg "
              onClick={() => navigate("/register")}
            >
              Đăng ký
            </button>
            <button className="navbar-btn navbar-btn-log" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Đăng xuất ?"
        message="Bạn có chắc muốn đăng xuất không ?"
        cancel="Huỷ"
        confirm="Đăng xuất"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </nav>
  );
}

export default Navbar;
