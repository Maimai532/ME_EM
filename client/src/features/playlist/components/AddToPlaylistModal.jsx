import { useEffect, useState } from "react";
import { X, Plus, ListMusic, Music } from "lucide-react";
import { usePlaylist } from "../context/PlaylistContext";
import "../styles/AddToPlaylistModal.css";
import { createPortal } from "react-dom";

export default function AddToPlaylistModal({ song, onClose }) {
  const { playlists, fetchPlaylists, createPlaylist, addSong, removeSong } =
    usePlaylist();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (!song) return;
    const idsContainingSong = playlists
      .filter((pl) => pl.songs?.some((s) => s._id === song._id))
      .map((pl) => pl._id);
    setAddedIds(new Set(idsContainingSong));
  }, [playlists, song]);

  async function handleToggle(playlistId) {
    if (addedIds.has(playlistId)) {
      await removeSong(playlistId, song._id);
    } else {
      await addSong(playlistId, song._id);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    const playlist = await createPlaylist(newName.trim());
    await addSong(playlist._id, song._id);
    setNewName("");
    setCreating(false);
  }

  return createPortal(
    <div className="atp-overlay" onClick={onClose}>
      <div className="atp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="atp-header">
          <span className="atp-title">Lưu vào playlist</span>
          <button className="atp-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Song info */}
        <div className="atp-song">
          {song.coverUrl || song.imageUrl ? (
            <img
              src={song.coverUrl || song.imageUrl}
              alt={song.title}
            />
          ) : (
            <div className="atp-song__cover-placeholder">
              <Music size={20} />
            </div>
          )}
          <div>
            <p className="atp-song__title">{song.title}</p>
            <p className="atp-song__artist">{song.artist}</p>
          </div>
        </div>

        {/* Playlist list */}
        <div className="atp-list">
          {playlists.length === 0 && (
            <p className="atp-empty">Chưa có playlist nào</p>
          )}
          {playlists.map((pl) => (
            <button
              key={pl._id}
              className={`atp-item ${addedIds.has(pl._id) ? "atp-item--active" : ""}`}
              onClick={() => handleToggle(pl._id)}
            >
              <ListMusic size={16} className="atp-item__icon" />
              <span className="atp-item__name">{pl.name}</span>
              <span className="atp-item__count">
                {pl.songs?.length ?? 0} bài
              </span>
            </button>
          ))}
        </div>
        {/* New playlist */}
        {creating ? (
          <div className="atp-create">
            <input
              autoFocus
              className="atp-input"
              placeholder="Tên playlist..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button className="atp-btn atp-btn--confirm" onClick={handleCreate}>
              Tạo
            </button>
            <button
              className="atp-btn atp-btn--cancel"
              onClick={() => setCreating(false)}
            >
              Huỷ
            </button>
          </div>
        ) : (
          <button className="atp-new" onClick={() => setCreating(true)}>
            <Plus size={16} />
            <span>Tạo playlist mới</span>
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
