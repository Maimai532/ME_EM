import { Input, Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const styles = {
  navbar: {
    width: "100%",
    height: "65px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 60px",
    backgroundColor: "#071c38",
    // borderBottom: "1px solid #212121",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    gap: "5px",
  },
  logo: {
    width: "40px",
    height: "40px",
    borderRadius: "9999px",
    objectFit: "cover",
    cursor: "pointer",
  },
  navMenu: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  primaryButtons: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  greenButton: {
    padding: "8px 16px",
    borderRadius: "5px",
    border: "1px solid #cadfec",
    cursor: "pointer",
    fontSize: "14px",
    backgroundColor: "#ffffff23",
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #cadfec",
    outline: "none",
    fontSize: "14px",
    width: "450px",
  },
};

function Navbar({ isOpen, setIsOpen, onLogout }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const userMenuItems = [
    { key: "1", label: <Link to="/profile">Profile</Link> },
    { key: "2", label: <Link to="/settings">Settings</Link> },
    {
      key: "3",
      label: (
        <span onClick={logout} style={{ cursor: "pointer", color: "#ef4444" }}>
          Logout
        </span>
      ),
    },
  ];

  return (
    <>
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 1000,
      }}>
        <header style={styles.navbar}>
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Logo"
              style={styles.logo}
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>

          <nav style={styles.navMenu}>
            <Input type="search" placeholder="Search..." style={styles.searchInput} />
          </nav>

          <div style={styles.primaryButtons}>
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button>You <DownOutlined /></Button>
              </Dropdown>
            ) : (
              <>
                <Button type="primary" style={styles.greenButton} onClick={() => navigate("/login")}>Login</Button>
                <Button type="primary" style={styles.greenButton} onClick={() => navigate("/register")}>Register</Button>
              </>
            )}
          </div>
        </header>
      </nav>

      {/* Đẩy content xuống đúng chiều cao navbar */}

    </>
  );
}
export default Navbar;
