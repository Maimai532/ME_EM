import { useState, useEffect } from "react";
import { artistService } from "../../../shared/services/artist.service";
import { songService } from "../../home/services/songService";

export default function AddSongModal({ artistId, albumId, onClose, onSaved }) {
  const [tab, setTab] = useState("existing"); // "existing" | "new"
  const [allSongs, setAllSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSongId, setSelectedSongId] = useState("");
  const [loading, setLoading] = useState(false);

  const [newSong, setNewSong] = useState({
    title: "",
    album: "",
    genre: "",
    audioUrl: "",
    imageUrl: "",
    sourceType: "url",
  });

  useEffect(() => {
    // Load danh sách tất cả songs để cho user chọn
    songService.getAll().then((res) => setAllSongs(res.data));
  }, []);

const filteredSongs = allSongs.filter((s) => {
  const q = search.toLowerCase();
  const matchTitle = s.title?.toLowerCase().includes(q);
  const matchArtist = s.artist
    ?.split(/,| và /)
    .map((a) => a.trim())
    .some((a) => a.toLowerCase().includes(q));
  return matchTitle || matchArtist;
});

  const handleAddExisting = async () => {
    if (!selectedSongId) return alert("Chọn một bài hát");
    setLoading(true);
    try {
      await artistService.addExistingSong(artistId, selectedSongId, albumId);
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi thêm bài hát");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    // Chỉ bắt buộc audioUrl khi chọn sourceType = url
    if (!newSong.title) return alert("Cần có tiêu đề");
    if (newSong.sourceType === "url" && !newSong.audioUrl)
      return alert("Cần có link nhạc");

    setLoading(true);
    try {
      await artistService.createNewSong(artistId, { ...newSong, albumId });
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo bài hát");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>Thêm bài hát</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="modal__tabs">
          <button
            className={tab === "existing" ? "active" : ""}
            onClick={() => setTab("existing")}
          >
            Chọn từ danh sách
          </button>
          <button
            className={tab === "new" ? "active" : ""}
            onClick={() => setTab("new")}
          >
            Thêm bài mới
          </button>
        </div>

        {/* Tab: chọn song có sẵn */}
        {tab === "existing" && (
          <div className="modal__body">
            <input
              className="modal_search"
              placeholder="Tìm theo tên bài / nghệ sĩ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ul className="song-picker">
              {filteredSongs.map((song) => (
                <li
                  key={song._id}
                  className={selectedSongId === song._id ? "selected" : ""}
                  onClick={() => setSelectedSongId(song._id)}
                >
                  <img
                    src={song.imageUrl || "/default-cover.png"}
                    alt={song.title}
                  />
                  <div>
                    <strong>{song.title}</strong>
                    <span>
  {song.artist?.split(/,| và /).map((a) => a.trim()).filter(Boolean).map((a) => (
    <span key={a} className="song-admin__artist-badge">{a}</span>
  ))}
</span>
                  </div>
                  {selectedSongId === song._id && <span>✓</span>}
                </li>
              ))}
              {filteredSongs.length === 0 && <li>Không tìm thấy bài nào</li>}
            </ul>
            <div className="modal__footer">
              <button onClick={onClose}>Hủy</button>
              <button
                onClick={handleAddExisting}
                disabled={loading || !selectedSongId}
              >
                {loading ? "Đang thêm..." : "Thêm vào nghệ sĩ"}
              </button>
            </div>
          </div>
        )}

        {/* Tab: thêm bài mới — cấu trúc giống NewSong modal */}
        {tab === "new" && (
          <form className="modal__body" onSubmit={handleCreateNew}>
            <p className="info-text">
              Bài hát mới sẽ được thêm vào hệ thống và liên kết với nghệ sĩ này.
            </p>
            <div className="form-group">
              <label>Tên bài hát *</label>
              <input
                value={newSong.title}
                onChange={(e) =>
                  setNewSong({ ...newSong, title: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Album</label>
              <input
                value={newSong.album}
                onChange={(e) =>
                  setNewSong({ ...newSong, album: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Thể loại</label>
              <input
                value={newSong.genre}
                onChange={(e) =>
                  setNewSong({ ...newSong, genre: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Link nhạc * (URL hoặc upload)</label>
              <select
                value={newSong.sourceType}
                onChange={(e) =>
                  setNewSong({ ...newSong, sourceType: e.target.value })
                }
              >
                <option value="url">URL</option>
                <option value="upload">Upload file</option>
              </select>
              <input
                value={newSong.audioUrl}
                onChange={(e) =>
                  setNewSong({ ...newSong, audioUrl: e.target.value })
                }
                placeholder="https://..."
                required
              />
            </div>
            <div className="form-group">
              <label>Ảnh bìa (URL)</label>
              <input
                value={newSong.imageUrl}
                onChange={(e) =>
                  setNewSong({ ...newSong, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="modal__footer">
              <button type="button" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo và thêm vào nghệ sĩ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
