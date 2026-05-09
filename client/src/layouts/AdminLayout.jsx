import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Music, ListMusic, Users, LogOut } from "lucide-react";

const navItems = [
  { to: "/admin",             label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/song_admin",       label: "Songs",     icon: Music },
  { to: "/admin/playlist_admin",   label: "Playlists", icon: ListMusic },
  { to: "/admin/user_admin",       label: "Users",     icon: Users },
];

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "220px",
    height: "100vh",
    backgroundColor: "#021835",
    display: "flex",
    flexDirection: "column",
    zIndex: 50,
  },
  logoBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "64px",
    borderBottom: "1px solid #2e4e7a",
    gap: "8px",
  },
  logoImg: {
    width: "75px",
    height: "75px",
  },
  logoText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "18px",
    letterSpacing: "0.05em",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "16px 12px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    color: "#93c5fd",
    transition: "background-color 0.2s, color 0.2s",
    
  },
  navLinkHover: {
    backgroundColor: "#1e4d8c",
    color: "#ffffff",
  },
  logoutBox: {
    padding: "12px",
    borderTop: "1px solid #2e4e7a",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#93c5fd",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s, color 0.2s",
  },
  main: {
    marginLeft: "220px",
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
};

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/home", { replace: true });
  }

  return (
    <div style={styles.wrapper}>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>

        {/* Logo */}
        <div style={styles.logoBox}>
          <img src="/logo2.png" alt="Logo" style={styles.logoImg} />
          <span style={styles.logoText}>ME_EM</span>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={styles.navLink}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={styles.logoutBox}>
          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { backgroundColor: "#1e4d8c", color: "#fff" })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { backgroundColor: "transparent", color: "#93c5fd" })}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;