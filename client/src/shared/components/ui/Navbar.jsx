import { useState } from "react"; // thêm
import { Input, Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { usePlayer } from "../../../features/player/context/PlayerContext";
import "../../styles/Navbar.css";
import { searchSongs } from "../../../features/home/services/songService";

function Navbar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { stopPlayer } = usePlayer();

  const [query, setQuery] = useState(""); // save keyword
  const [results, setResults] = useState([]); // ds tìm đc
  const [searching, setSearching] = useState(false); // có call api k
  // const [theme, setTheme] = useState(
  //   () => localStorage.getItem("theme") || "light"
  // );

  // function toggleTheme() {
  //   const next = theme === "light" ? "dark" : "light";
  //   setTheme(next);
  //   document.documentElement.setAttribute("data-theme", next);
  //   localStorage.setItem("theme", next);
  // }

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) {
      // rỗng -> xoá kq, k call api
      setResults([]);
      return;
    }

    setSearching(true); // đánh dấu đg tk
    const songs = await searchSongs(value); // gọi api
    setResults(songs);
    setSearching(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${query}`);
      setResults([]);
    }
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

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src="/logo2.png"
          alt="Logo"
          className="navbar-logo"
          onClick={() => setIsOpen(!isOpen)}
        />
        <h1 className="navbar-title">Me_EM</h1>
      </div>

      <nav className="navbar-search">
        <Input
          type="search"
          placeholder="Search..."
          className="navbar-input"
          value={query}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
        />
        {results.length > 0 && (
          <div className="search-results">
            {searching && <p className="search-loading">Đang tìm...</p>}
            {results.map((song) => (
              <div
                key={song._id}
                className="search-item"
                onClick={() => {
                  navigate(`/player/${song._id}`);
                  setQuery("");
                  setResults([]);
                }}
              >
                <img
                  src={song.imageUrl || "/placeholder.jpg"}
                  alt={song.title}
                />
                <div>
                  <p className="search-item__title">{song.title}</p>
                  <p className="search-item__artist">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* <button className="theme" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </button> */}

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
