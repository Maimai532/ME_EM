import { useState, useRef, useEffect } from "react";
import { Input, Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { Clock, X } from "lucide-react";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { usePlayer } from "../../../features/player/context/PlayerContext";
import "../../styles/Navbar.css";
import { searchSongs } from "../../../features/home/services/songService";

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
  const { isLoggedIn, logout } = useAuth();
  const { stopPlayer } = usePlayer();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState(getHistory());
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
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
    setResults(songs);
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
    navigate("/");
  };

  const userMenuItems = [
    { key: "1", label: <Link to="/profile">Profile</Link> },
    { key: "2", label: <Link to="/settings">Settings</Link> },
    { key: "3", label: <button onClick={handleLogout}>Logout</button> },
  ];

  const showHistory = history.length > 0;
  const showResults = results.length > 0;
  const isDropdownOpen = showDropdown && (showHistory || showResults);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src="/logo2.png"
          alt="Logo"
          className="navbar-logo"
          onClick={() => setIsOpen(!isOpen)}
        />
        {/* <h1 className="navbar-title">Me_EM</h1> */}
      </div>

      <nav className="navbar-search" ref={wrapperRef}>
        <Input
          type="search"
          placeholder="Search..."
          className="navbar-input"
          value={query}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
        />

        {/* 1 dropdown duy nhất chứa cả lịch sử + kết quả */}
        {isDropdownOpen && (
          <div className="search-dropdown">

            {/* Lịch sử */}
            {showHistory && (
              <div className="search-dropdown__section">
                <p className="search-dropdown__label">Lịch sử tìm kiếm</p>
                {history.map((item) => (
                  <div
                    key={item}
                    className="search-dropdown__history-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleHistoryClick(item)}
                  >
                    <Clock size={14} className="search-dropdown__clock" />
                    <span className="search-dropdown__history-text">{item}</span>
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

            {/* Divider nếu có cả 2 */}
            {showHistory && showResults && (
              <div className="search-dropdown__divider" />
            )}

            {/* Kết quả API */}
            {showResults && (
              <div className="search-dropdown__section">
                <p className="search-dropdown__label">Kết quả</p>
                {searching && <p className="search-dropdown__loading">Đang tìm...</p>}
                {results.map((song) => (
                  <div
                    key={song._id}
                    className="search-dropdown__result-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      navigate(`/player/${song._id}`);
                      setQuery("");
                      setResults([]);
                      setShowDropdown(false);
                    }}
                  >
                    <img
                      src={song.imageUrl || "/placeholder.jpg"}
                      alt={song.title}
                      className="search-dropdown__result-img"
                    />
                    <div>
                      <p className="search-dropdown__result-title">{song.title}</p>
                      <p className="search-dropdown__result-artist">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </nav>

      <div className="navbar-actions">
        {isLoggedIn ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button>
              You <DownOutlined />
            </Button>
          </Dropdown>
        ) : (
          <>
            <button className="navbar-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className="navbar-btn"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;