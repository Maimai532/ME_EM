import { Link } from "react-router-dom";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 998,
  },

  aside: {
    position: "fixed",
    top: "64px",
    left: 0,
    width: "220px",
    height: "100vh",
    backgroundColor: "#e3e8ed",
    borderRight: "1px solid #e4e4e7",
    padding: "10px",
    zIndex: 999,

    transition: "transform 0.3s ease",
  },

  navMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  tag: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    color: "#374151",
    textDecoration: "none",
    borderRadius: "5px",
  },
};

function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* nền tối */}
      {isOpen && (
        <div
          style={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside
        style={{
          ...styles.aside,
          transform: isOpen
            ? "translateX(0)"
            : "translateX(-100%)",
        }}
      >
        <nav style={styles.navMenu}>
          <Link
            to="/"
            style={styles.tag}
            className="hover:bg-zinc-500"
          >
            Home
          </Link>

          <Link
            to="/library"
            style={styles.tag}
            className="hover:bg-zinc-500"
          >
            Library
          </Link>

          <Link
            to="/favorite"
            style={styles.tag}
            className="hover:bg-zinc-500"
          >
            Favorite
          </Link>

          <Link
            to="/history"
            style={styles.tag}
            className="hover:bg-zinc-500"
          >
            History
          </Link>

          <Link
            to="/search"
            style={styles.tag}
            className="hover:bg-zinc-500"
          >
            Search
          </Link>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;