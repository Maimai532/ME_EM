import { Link } from "react-router-dom";
import "../../styles/Sidebar.css";

function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "" : "sidebar--closed"}`}>
      <nav className="sidebar__nav">
        <Link to="/home" className="sidebar__link">
          <img src="/home.png" alt="Home" className="sidebar__icon" />
          Home
        </Link>
        <Link to="/library" className="sidebar__link">
          <img src="/library.png" alt="Library" className="sidebar__icon" />
          Library
        </Link>
        {/* <Link to="/favorite" className="sidebar__link">
          <img src="/favorite.png" alt="Favorite" className="sidebar__icon" />
          Favorite
        </Link> */}
        <Link to="/history" className="sidebar__link">
          <img src="/history.png" alt="History" className="sidebar__icon" />
          History
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
