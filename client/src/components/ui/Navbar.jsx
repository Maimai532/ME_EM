import { Input, Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayer } from "../../context/PlayerContext";
import "../../styles/Navbar.css";

function Navbar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { stopPlayer } = usePlayer();

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
    <nav className="navbar-fixed">
      <header className="navbar">
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
          />
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
              <button className="navbar-btn" onClick={() => navigate("/register")}>
                Register
              </button>
            </>
          )}
        </div>
      </header>
    </nav>
  );
}

export default Navbar;