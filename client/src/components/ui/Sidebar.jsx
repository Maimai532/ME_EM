import { Link } from "react-router-dom";

const styles = {
  aside: {
    width: "150px",
    minWidth: "150px",
    height: "calc(100vh - 65px)",
    backgroundColor: "#e3e8ed",
    borderRight: "1px solid #e4e4e7",
    padding: "10px",
    position: "sticky",
    top: "65px",
    alignSelf: "flex-start",
    transition: "all 0.3s ease",
    overflow: "hidden",
   
  },
  asideClosed: {
    width: "0px",
    minWidth: "0px",
    padding: "0px",
  },
  navMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    width: "160px", // giữ cố định để không bị vỡ khi đóng
  },
  tag: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    color: "#18263d",
    textDecoration: "none",
    borderRadius: "5px",
    whiteSpace: "nowrap",
  },
  img: {
    width: "20px",
    height: "20px",
    flexShrink: 0,
  },
};

function Sidebar({ isOpen }) {
  return (
    <aside style={{ ...styles.aside, ...(isOpen ? {} : styles.asideClosed) }}>
      <nav style={styles.navMenu}>
        <Link to="/library" style={styles.tag} className="hover:bg-zinc-300">
          <img src="/library.png" alt="Library" style={styles.img} />
          Library
        </Link>
        <Link to="/favorite" style={styles.tag} className="hover:bg-zinc-300">
          <img src="/favorite.png" alt="Favorite" style={styles.img} />
          Favorite
        </Link>
        <Link to="/history" style={styles.tag} className="hover:bg-zinc-300">
          <img src="/history.png" alt="History" style={styles.img} />
          History
        </Link>

      </nav>
    </aside>
  );
}

export default Sidebar;