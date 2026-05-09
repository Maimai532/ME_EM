import { Input, Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const styles = {
  navbar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "white",
    borderBottom: "1px solid #e4e4e7",
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
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    backgroundColor: "#10b981",
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e4e4e7",
    outline: "none",
    fontSize: "14px",
    maxWidth: "350px",
  },
};

function Navbar_Admin({ isOpen, setIsOpen, onLogout }) {
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
  const getNavStyle = (visible) => ({
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: "transform 0.3s ease",
    transform: visible ? "translateY(0)" : "translateY(-100%)",
  });
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;

      if (currentY < 10) {
        // Ở đầu trang → luôn hiện
        setVisible(true);
      } else if (currentY < lastScrollY) {
        // Cuộn lên → hiện
        setVisible(true);
      } else {
        // Cuộn xuống → ẩn
        setVisible(false);
      }

      setLastScrollY(currentY);
    }

    window.addEventListener("scroll", handleScroll);

    // Cleanup: gỡ event khi component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav style={getNavStyle(visible)}>
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
          <Input
            type="search"
            placeholder="Search..."
            style={styles.searchInput}
          />
        </nav>

        <div style={styles.primaryButtons}>
          {/*
            condition ? valueIfTrue : valueIfFalse _ nếu... thì... không thì... 
            condition =  if (condition === true) 
          */}
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button>
                You <DownOutlined />
              </Button>
            </Dropdown>
          ) : (
            <>
              <Button
                type="primary"
                style={styles.greenButton}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>

              <Button
                type="primary"
                style={styles.greenButton}
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
              <Button
                type="primary"
                style={styles.greenButton}
                onClick={() => navigate("/admin")}
              >
                Admin
              </Button>

          
            </>
          )}
        </div>
      </header>
    </nav>
  );
}

export default Navbar_Admin;
