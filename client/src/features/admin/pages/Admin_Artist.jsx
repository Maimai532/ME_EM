import { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import { API_URL } from "../../../shared/constants/api";
import ArtistForm from "../components/ArtistForm";
import ArtistDetail from "../components/ArtistDetail";
import { artistService } from "../../../shared/services/artist.service";
import "../styles/Admin_Artist.css";

export default function ArtistManagement() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchArtists = useCallback(async () => {
    try {
      const res = await artistService.getAll();
      // ✅ Merge thay vì replace — giữ nguyên item đã có, chỉ update khác biệt
      setArtists((prev) => {
        const incoming = res.data;
        if (prev.length === 0) return incoming;
        // Giữ avatar cũ nếu _id match và avatar mới rỗng (B2 chưa resolve)
        return incoming.map((newA) => {
          const old = prev.find((o) => o._id === newA._id);
          return old ? { ...newA, avatar: newA.avatar || old.avatar } : newA;
        });
      });
    } catch {
      alert("Lỗi khi tải danh sách nghệ sĩ");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   const synced = localStorage.getItem("songs_synced_v1");
  //   if (!synced) {
  //     axios
  //       .post(`${API_URL}/artists/sync-songs`)
  //       .then(() => localStorage.setItem("songs_synced_v1", "true"))
  //       .catch(() => {})
  //       .finally(() => fetchArtists()); // fetch sau khi sync xong (hoặc lỗi)
  //   } else {
  //     fetchArtists();
  //   }
  // }, [fetchArtists]);
  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

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
      // ✅ Xóa local thay vì re-fetch — không cần gọi API lại
      setArtists((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
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
            // ✅ Key ổn định = _id (không đổi giữa các fetch)
            <ArtistCard
              key={artist._id}
              artist={artist}
              onView={() => {
                setSelected(artist);
                setView("detail");
              }}
              onEdit={() => openEdit(artist)}
              onDelete={() => handleDelete(artist._id)}
            />
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

// ✅ Tách thành component riêng + React.memo
// → card không re-render khi artist khác thay đổi
const ArtistCard = memo(function ArtistCard({
  artist,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="artist-card" onClick={onView} style={{ cursor: "pointer" }}>
      <img
        src={artist.avatar || "/default-artist.png"}
        alt={artist.name}
        className="artist-card__avatar"
        // ✅ Không load lại ảnh nếu src không đổi
        loading="lazy"
      />
      <div className="artist-card__info">
        <h3>{artist.name}</h3>
        <span>{artist.country || "Không rõ"}</span>
        <span>
          {artist.songs?.length || 0} bài · {artist.albums?.length || 0} album
        </span>
      </div>
      <div
        className="artist-card__actions"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onEdit}>Sửa</button>
        <button className="btn--danger" onClick={onDelete}>
          Xóa
        </button>
      </div>
    </div>
  );
});
