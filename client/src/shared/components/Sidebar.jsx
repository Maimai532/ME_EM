import { NavLink } from "react-router-dom";
import "./../styles/Sidebar.css";

function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "" : "sidebar--closed"}`}>
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
    </aside>
  );
}

export default Sidebar;