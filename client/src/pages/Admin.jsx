import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

import useSections from "../hooks/useSections";
import SongSection from "../components/song/SongSection";
import ArtistSection from "../components/song/ArtistSection";

const API_URL = "http://localhost:8080/api";

const styles = {
  dashboard: {  padding: "0 20px", display: "flex", justifyContent: "center", flexDirection: "column",  },
  log: { width: "100%", margin: "20px 0", display: "flex", gap: "20px" },
  info: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    gap: "25px",
    padding: "30px",
    backgroundColor: "#dbe8f68d",
    borderRadius: "8px",
    border: "1px solid #2e4e7a",
    flex: 1,
  },
  title: { color: "#1f1f1f", fontSize: "22px", fontWeight: "600" },
  count: { fontSize: "32px", fontWeight: "700", color: "#2563eb" },
  list: { 

   },
};

function Admin() {
  useEffect(() => {
    document.title = "Admin";
  }, []);

  const { token } = useAuth();
  const [userCount, setUserCount] = useState("...");
  const [songCount, setSongCount] = useState("..."); // sau thêm song API
  const { sections, loading } = useSections();

  useEffect(() => {
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    axios
      .get(`${API_URL}/users`, authHeader)
      .then((res) => setUserCount(res.data.length))
      .catch(() => setUserCount("?"));

    axios
      .get(`${API_URL}/songs`)
      .then((res) => setSongCount(res.data.data.length))
      .catch(() => setSongCount("?"));
  }, []);

  function handlePlay(song) {
    console.log("Phát bài:", song.title);
    // TODO: gọi playerContext.playSong(song) sau
  }
  return (
    <div style={styles.dashboard}>
      <h1 className="text-2xl font-semibold text-blue-900 mb-6">Dashboard</h1>

      <div style={styles.log}>
        <div style={styles.info}>
          <h2 style={styles.title}>Song</h2>
          <p style={styles.count}>{songCount} </p>
        </div>
        <div style={styles.info}>
          <h2 style={styles.title}>User</h2>
          <p style={styles.count}>{userCount}</p>
        </div>
      </div>

      <div style={styles.list}>
        <div style={styles.content}>

          <div style={styles.section}>
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              sections.map((section) => (
                <SongSection
                  key={section._id}
                  title={section.name}
                  songs={section.songs}
                  layout={section.layout}
                  songList={section.songs}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
