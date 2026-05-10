import { Link } from "react-router-dom";

const styles = {
  aside: {
    maxWidth: "140px",
    minWidth: "140px",
    height: "calc(100vh - 65px)",
    backgroundColor: "#000000",
    padding: "5px",
    position: "sticky",
    top: "65px",
    alignSelf: "flex-start",
    overflow: "hidden",
    transition: "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  asideClosed: {
    maxWidth: "0px",
    minWidth: "0px",
    padding: "0px",
  },
  navMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    width: "130px", // cố định để chữ không bị vỡ khi đóng
  },
  tag: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    padding: "10px 12px", 
    color: "#eeeeee",
    textDecoration: "none",
    borderRadius: "5px",
    whiteSpace: "nowrap",
  },
  img: {
    width: "12px",
    height: "12px",
    flexShrink: 0,
  },
};

function Sidebar({ isOpen }) {
  return (
    <aside style={{ ...styles.aside, ...(isOpen ? {} : styles.asideClosed) }}>
      <nav style={styles.navMenu}>
        <Link to="/home" style={styles.tag} className="hover:bg-zinc-800">
          <img src="/home.png" alt="Home" style={styles.img} />
          Home
        </Link>
        <Link to="/library" style={styles.tag} className="hover:bg-zinc-800">
          <img src="/library.png" alt="Library" style={styles.img} />
          Library
        </Link>
        <Link to="/favorite" style={styles.tag} className="hover:bg-zinc-800">
          <img src="/favorite.png" alt="Favorite" style={styles.img} />
          Favorite
        </Link>
        <Link to="/history" style={styles.tag} className="hover:bg-zinc-800">
          <img src="/history.png" alt="History" style={styles.img} />
          History
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;