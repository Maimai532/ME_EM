import { Input, Button } from "antd";
import { Link,useNavigate } from "react-router-dom";
import { useState } from 'react'

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
    
  },
  Button: {
    padding: "8px 16px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    backgroundColor: "#10b981",
  },

  searchInput: {
    padding: "8px 12px",
    borderRadius: "5px",
    border: "1px solid #e4e4e7",
    outline: "none",
    fontSize: "14px",
  },
};

function Navbar() {

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault()
  };
  return (
    <header style={styles.navbar}>
      <img
        src="/logo.png"
        alt="Logo"
        style={styles.logo}
      />

      <nav style={styles.navMenu}>
        <Input
          type="search"
          placeholder="Search..."
          style={styles.searchInput}
        />
      </nav>
      <div style={styles.primaryButtons}>
        <Button type="primary" 
          style={styles.Button}
          onClick={() => navigate("/Login")}
        >
          Login
        </Button>

        <Link to="/Register">
          <Button type="primary" style={styles.Button}>
            Register
            
          </Button>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;