import { useState, useEffect } from "react";
import ArtistForm from "../components/ArtistForm";
import ArtistDetail from "../components/ArtistDetail";
import { artistService } from "../../../shared/services/artist.service";
import "../styles/Admin_Artist.css";

export default function ArtistManagement() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "detail"
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false); // ← popup form

  const fetchArtists = async () => {
    try {
      const res = await artistService.getAll();
      setArtists(res.data);
    } catch {
      alert("Lỗi khi tải danh sách nghệ sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter((artist) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      artist.name?.toLowerCase().includes(q) ||
      artist.country?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id) => {
    if (!confirm("Xóa nghệ sĩ này? Các bài hát sẽ không bị xóa.")) return;
    try {
      await artistService.delete(id);
      setArtists((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Full error:", err);
      alert(err.response?.data?.message || "Lỗi khi xóa nghệ sĩ");
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setSelected(null);
    fetchArtists();
  };

  const openCreate = () => {
    setSelected(null);
    setShowForm(true);
  };
  const openEdit = (artist) => {
    setSelected(artist);
    setShowForm(true);
  };

  if (view === "detail") {
    return (
      <ArtistDetail
        artistId={selected._id}
        onBack={() => {
          setView("list");
          setSelected(null);
        }}
        onEdit={() => openEdit(selected)}
      />
    );
  }

  return (
    <div className="artist-management">
      <div className="artist-management__header">
        <h2>Quản lý nghệ sĩ</h2>
        <button className="artist-management-btn" onClick={openCreate}>
          New Artist
        </button>
      </div>

      <div className="artist-management__search">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc quốc gia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="artist-search-input"
        />
        {searchQuery && (
          <button
            className="artist-search-clear"
            onClick={() => setSearchQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="artist-list">
          {filteredArtists.map((artist) => (
            <div
              key={artist._id}
              className="artist-card"
              onClick={() => {
                setSelected(artist);
                setView("detail");
              }}
              style={{ cursor: "pointer" }}
            >
              <img
                src={artist.avatar || "/default-artist.png"}
                alt={artist.name}
                className="artist-card__avatar"
              />
              <div className="artist-card__info">
                <h3>{artist.name}</h3>
                <span>{artist.country || "Không rõ"}</span>
                <span>
                  {artist.songs?.length || 0} bài · {artist.albums?.length || 0}{" "}
                  album
                </span>
              </div>
              <div
                className="artist-card__actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => openEdit(artist)}>Sửa</button>
                <button
                  className="btn--danger"
                  onClick={() => handleDelete(artist._id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {filteredArtists.length === 0 && (
            <p>
              {searchQuery
                ? `Không tìm thấy nghệ sĩ nào khớp với "${searchQuery}".`
                : "Chưa có nghệ sĩ nào."}
            </p>
          )}
        </div>
      )}

      {/* Popup ArtistForm */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowForm(false);
            setSelected(null);
          }}
        >
          <div
            className="modal modal--large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>{selected ? "Sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelected(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <ArtistForm
                artist={selected}
                onSaved={handleSaved}
                onCancel={() => {
                  setShowForm(false);
                  setSelected(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
