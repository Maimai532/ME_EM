import { useState, useEffect } from "react";
import { Music, Users, Mic2, ListMusic, PlayCircle, UserPlus } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { statsService } from "../services/statsService";
import AdminPage from "./Admin_Page";
import "../styles/Admin_Dashboard.css";

function StatCard({ icon: Icon, label, value, tone = "default" }) {
  return (
    <div className={`dashboard__card dashboard__card--${tone}`}>
      <div className="dashboard__card-icon">
        <Icon size={20} />
      </div>
      <div className="dashboard__card-body">
        <span className="dashboard__card-value">{value}</span>
        <span className="dashboard__card-label">{label}</span>
      </div>
    </div>
  );
}
function fillTimeline(data, days) {
  const map = Object.fromEntries(data.map((d) => [d._id, d.count]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    // const key = d.toISOString().slice(0, 10);
    const key = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    return { _id: key, count: map[key] ?? 0 };
    
  });
}
function PlaysMiniChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="dashboard__chart-empty">Chưa có dữ liệu lượt nghe</p>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const barWidth = 100 / data.length;

  return (
    <svg viewBox="0 0 100 40" className="dashboard__chart" preserveAspectRatio="none">
      {data.map((d, i) => {
        const h = (d.count / max) * 34;
        return (
          <g key={d._id}>
            <rect
              x={i * barWidth + barWidth * 0.15}
              y={38 - h}
              width={barWidth * 0.7}
              height={h}
              rx="0.6"
              className="dashboard__chart-bar"
            >
              <title>{`${d._id}: ${d.count} lượt nghe`}</title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}
function MissingAlert({ count, label, to }) {
  if (!count) return null;
  return (
    <a href={to} className="dashboard__missing-item">
      <span className="dashboard__missing-count">{count}</span>
      <span>{label}</span>
    </a>
  );
}

export default function Admin_Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  useEffect(() => {
    statsService
      .getDashboard(token, 7)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="dashboard__loading">Đang tải...</p>;
  if (!stats) return <p className="dashboard__loading">Không thể tải thống kê</p>;

  const { totals, missingData, topSongs, topArtists, playsTimeline, recentUsers, recentSongs } = stats;

  return (
    <AdminPage title="Tổng quan hệ thống">
      <div className="dashboard__cards">
        <StatCard icon={Music} label="Bài hát" value={totals.songs} />
        <StatCard icon={Mic2} label="Nghệ sĩ" value={totals.artists} />
        <StatCard icon={Users} label="Người dùng" value={totals.users} />
        <StatCard icon={ListMusic} label="Playlist" value={totals.playlists} />
        <StatCard icon={PlayCircle} label="Tổng lượt nghe" value={totals.plays} tone="accent" />
        <StatCard icon={UserPlus} label="User mới (7 ngày)" value={totals.newUsers} tone="accent" />
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__panel">
          <h3 className="dashboard__panel-title">Lượt nghe 7 ngày qua</h3>
          <PlaysMiniChart data={fillTimeline(playsTimeline, 7)} />
        </div>

        <div className="dashboard__panel">
          <h3 className="dashboard__panel-title">Dữ liệu cần bổ sung</h3>
          <div className="dashboard__missing-list">
            <MissingAlert count={missingData.image} label="bài thiếu ảnh" to="/admin/song_admin" />
            <MissingAlert count={missingData.audio} label="bài thiếu audio" to="/admin/song_admin" />
            <MissingAlert count={missingData.genre} label="bài thiếu thể loại" to="/admin/song_admin" />
            {!missingData.image && !missingData.audio && !missingData.genre && (
              <p className="dashboard__missing-empty">Dữ liệu đầy đủ 🎉</p>
            )}
          </div>
        </div>

        <div className="dashboard__panel">
          <h3 className="dashboard__panel-title">Top 10 bài hát</h3>
          <ol className="dashboard__list">
            {topSongs.map((s) => (
              <li key={s._id}>
                <span className="dashboard__list-name">{s.title}</span>
                <span className="dashboard__list-value">{s.plays} lượt</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="dashboard__panel">
          <h3 className="dashboard__panel-title">Top 10 nghệ sĩ</h3>
          <ol className="dashboard__list">
            {topArtists.map((a) => (
              <li key={a._id}>
                <span className="dashboard__list-name">{a.name}</span>
                <span className="dashboard__list-value">{a.totalPlays} lượt</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="dashboard__panel">
          <h3 className="dashboard__panel-title">User mới đăng ký</h3>
          <ul className="dashboard__activity">
            {recentUsers.map((u) => (
              <li key={u._id}>
                <span>{u.username}</span>
                <span className="dashboard__activity-date">
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard__panel">
          <h3 className="dashboard__panel-title">Bài hát mới thêm</h3>
          <ul className="dashboard__activity">
            {recentSongs.map((s) => (
              <li key={s._id}>
                <span>{s.title} — {s.artist}</span>
                <span className="dashboard__activity-date">
                  {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminPage>
  );
}