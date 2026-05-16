import { useState, useEffect } from "react";
import AddSongModal from "./AddSongModal";
import AddAlbumModal from "./AddAlbumModal";
import { artistService } from "../../../shared/services/artist.service";

export default function ArtistDetail({ artistId, onBack, onEdit }) {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [targetAlbumId, setTargetAlbumId] = useState(null);
  const [expandedAlbumId, setExpandedAlbumId] = useState(null);
  const [albumContextMenu, setAlbumContextMenu] = useState(null); // { x, y, albumId }
  const [songContextMenu, setSongContextMenu] = useState(null);   // { x, y, songId }

  const fetchArtist = async () => {
    try {
      const res = await artistService.getById(artistId);
      setArtist(res.data);
    } catch {
      alert("Lỗi khi tải thông tin nghệ sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArtist(); }, [artistId]);

  // Đóng cả 2 context menu khi click ra ngoài
  useEffect(() => {
    const close = () => {
      setAlbumContextMenu(null);
      setSongContextMenu(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const handleRemoveSong = async (songId) => {
    if (!confirm("Gỡ bài hát này khỏi nghệ sĩ?")) return;
    try {
      await artistService.removeSong(artistId, songId);
      fetchArtist();
    } catch {
      alert("Lỗi khi gỡ bài hát");
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!confirm("Xóa album này?")) return;
    try {
      await artistService.deleteAlbum(artistId, albumId);
      fetchArtist();
    } catch {
      alert("Lỗi khi xóa album");
    }
  };

  const handleAlbumContextMenu = (e, albumId) => {
    e.preventDefault();
    e.stopPropagation();
    setSongContextMenu(null);
    setAlbumContextMenu({ x: e.clientX, y: e.clientY, albumId });
  };

  const handleSongContextMenu = (e, songId) => {
    e.preventDefault();
    e.stopPropagation();
    setAlbumContextMenu(null);
    setSongContextMenu({ x: e.clientX, y: e.clientY, songId });
  };

  if (loading) return <p>Đang tải...</p>;
  if (!artist) return <p>Không tìm thấy nghệ sĩ.</p>;

  const albumSongIds = artist.albums.flatMap((a) =>
    a.songs.map((s) => s._id || s)
  );
  const standaloneSongs = artist.songs.filter(
    (s) => !albumSongIds.includes(s._id?.toString())
  );

  return (
    <div className="artist-detail">
      {/* Header */}
      <div className="artist-detail__header">
        <button onClick={onBack}>← Back</button>
        <button onClick={onEdit}>✏ Edit</button>
      </div>

      {/* Thông tin nghệ sĩ */}
      <div className="artist-detail__info">
        <img src={artist.avatar || "/default-artist.png"} alt={artist.name} />
        <div>
          <h2>{artist.name}</h2>
          <p>{artist.country}</p>
          <p>{artist.description}</p>
        </div>
      </div>

      {/* Albums */}
      <section className="artist-detail__section">
        <div className="section-header">
          <h3>Albums ({artist.albums.length})</h3>
          <button onClick={() => setShowAddAlbum(true)}>+ Thêm album</button>
        </div>

        {artist.albums.map((album) => (
          <div key={album._id} className="album-card">
            <div
              className="album-card__header"
              onClick={() =>
                setExpandedAlbumId(expandedAlbumId === album._id ? null : album._id)
              }
              onContextMenu={(e) => handleAlbumContextMenu(e, album._id)}
              style={{ cursor: "pointer" }}
            >
              {album.coverImage && (
                <img src={album.coverImage} alt={album.title} />
              )}
              <div>
                <h4>{album.title}</h4>
                <span>{album.releaseYear || "Chưa rõ năm"}</span>
                <span> · {album.songs.length} bài</span>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 12 }}>
                {expandedAlbumId === album._id ? "▲" : "▼"}
              </span>
            </div>

            {expandedAlbumId === album._id && (
              <ul className="song-list">
                {album.songs.map((song) => (
                  <li
                    key={song._id}
                    className="song-item"
                    onContextMenu={(e) => handleSongContextMenu(e, song._id)}
                    style={{ cursor: "context-menu" }}
                  >
                    <img src={song.imageUrl} alt={song.title} />
                    <span>{song.title}</span>
                  </li>
                ))}
                {album.songs.length === 0 && <li>Chưa có bài hát</li>}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Songs đứng riêng */}
      <section className="artist-detail__section">
        <div className="section-header">
          <h3>Bài hát ({standaloneSongs.length})</h3>
          <button onClick={() => { setTargetAlbumId(null); setShowAddSong(true); }}>
            + Thêm bài
          </button>
        </div>
        <ul className="song-list">
          {standaloneSongs.map((song) => (
            <li
              key={song._id}
              className="song-item"
              onContextMenu={(e) => handleSongContextMenu(e, song._id)}
              style={{ cursor: "context-menu" }}
            >
              <img src={song.imageUrl} alt={song.title} />
              <span>{song.title}</span>
            </li>
          ))}
          {standaloneSongs.length === 0 && <li>Chưa có bài hát riêng lẻ</li>}
        </ul>
      </section>

      {/* Context menu — Album */}
      {albumContextMenu && (
        <div
          className="context-menu"
          style={{ top: albumContextMenu.y, left: albumContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setTargetAlbumId(albumContextMenu.albumId);
              setShowAddSong(true);
              setAlbumContextMenu(null);
            }}
          >
            + Add song
          </button>
          <button
            className="btn--danger"
            onClick={() => {
              handleDeleteAlbum(albumContextMenu.albumId);
              setAlbumContextMenu(null);
            }}
          >
            Delete album
          </button>
        </div>
      )}

      {/* Context menu — Song */}
      {songContextMenu && (
        <div
          className="context-menu"
          style={{ top: songContextMenu.y, left: songContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn--danger"
            onClick={() => {
              handleRemoveSong(songContextMenu.songId);
              setSongContextMenu(null);
            }}
          >
            Gỡ bài hát
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddSong && (
        <AddSongModal
          artistId={artistId}
          albumId={targetAlbumId}
          onClose={() => { setShowAddSong(false); setTargetAlbumId(null); }}
          onSaved={() => { setShowAddSong(false); fetchArtist(); }}
        />
      )}

      {showAddAlbum && (
        <AddAlbumModal
          artistId={artistId}
          onClose={() => setShowAddAlbum(false)}
          onSaved={() => { setShowAddAlbum(false); fetchArtist(); }}
        />
      )}
    </div>
  );
}