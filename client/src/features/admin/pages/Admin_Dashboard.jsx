import { useState, useEffect } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import axios from "axios";

import AdminPage from "./Admin_Page";
import useSections from "../../home/hooks/useSections";
import SongSection from "../../home/components/SongSection";
import "../styles/Admin_Dashboard.css";
import { API_URL } from "../../../shared/constants/api";

function Admin() {
  useEffect(() => {
    document.title = "Admin";
  }, []);

  const { token } = useAuth();
  const [userCount, setUserCount] = useState("...");
  const [songCount, setSongCount] = useState("...");
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
  }, [token]);

  return (
    <AdminPage title="Dashboard">
      <div className="admin-dashboard__stats">
        <div className="admin-dashboard__stat-card">
          <h2 className="admin-dashboard__stat-title">Song</h2>
          <p className="admin-dashboard__stat-count">{songCount}</p>
        </div>
        <div className="admin-dashboard__stat-card">
          <h2 className="admin-dashboard__stat-title">User</h2>
          <p className="admin-dashboard__stat-count">{userCount}</p>
        </div>
      </div>

      <div className="admin-dashboard__sections">
        <div className="admin-dashboard__section-list">
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
    </AdminPage>
  );
}

export default Admin;