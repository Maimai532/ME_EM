// SongSection.jsx

import SongCard from "./SongCard";

// layout = "scroll" : hàng ngang cuộn
// layout = "grid"   : lưới nhiều cột
// layout = "list"   : danh sách dọc
const styles = {
  section: {
    marginBottom: "32px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    overflow: "hidden",
  },
  song: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  button: {
    fontSize: "14px",
    color: "#007bff",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
  },
};

function SongSection({ title, songs = [], onPlay, layout = "scroll" }) {
  //props mặc định: scroll

  const gridStyle = {
    scroll: {
      display: "flex",
      flexDirection: "row",
      gap: "16px",
      paddingBottom: "8px",
      overflowX: "auto",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: "16px",
    },
    list: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      height: "300px",
      overflowY: "auto",
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.song}>
        <h2 style={styles.title}>{title}</h2>
        <button style={styles.button}>Xem tất cả</button>
      </div>

      <div style={gridStyle[layout]}>
        {songs.map((song) => (
          <SongCard
            key={song._id}
            song={song}
            onPlay={onPlay}
            layout={layout}
          />
        ))}
      </div>
    </section>
  );
}

export default SongSection;
