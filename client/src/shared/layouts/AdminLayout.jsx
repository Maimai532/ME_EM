import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { LayoutDashboard, Music, ListMusic, Users, LogOut } from "lucide-react";
import "../../features/admin/styles/AdminLayout.css";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/song_admin", label: "Songs", icon: Music },
  { to: "/admin/playlist_admin", label: "Playlists", icon: ListMusic },
  { to: "/admin/user_admin", label: "Users", icon: Users },
];

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/home", { replace: true });
  }

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__logo-box">
          <img src="/logo2.png" alt="Logo" className="admin-layout__logo-img" />
          <span className="admin-layout__logo-text">ME_EM</span>
        </div>

        <nav className="admin-layout__nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive
                  ? "admin-layout__nav-link admin-layout__nav-link--active"
                  : "admin-layout__nav-link"
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-layout__logout-box">
          <button type="button" className="admin-layout__logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
