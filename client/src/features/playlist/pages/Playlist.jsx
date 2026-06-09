import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Play, Trash2 } from "lucide-react";
import { usePlayer } from "../../player/context/PlayerContext";
import { usePlaylist } from "../context/PlaylistContext";
import * as playlistService from "../services/playlistService";

export default function Playlist() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const { removeSong } = usePlaylist();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await playlistService.getPlaylistById(id);
        setPlaylist(res.data?.data ?? res.data);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) return <p style={{ padding: 32, color: "#fff" }}>Đang tải...</p>;
  if (!playlist) return <p style={{ padding: 32, color: "#fff" }}>Không tìm thấy playlist</p>;

  const songs = playlist.songs ?? [];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 800 }}>
      <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        {playlist.name}
      </h1>

      {songs.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Playlist chưa có bài nào.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {songs.map((song, index) => (
            <div
              key={song._id}
              onClick={() => playSong(song, songs)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            >
              <span style={{ color: "rgba(255,255,255,0.3)", width: 20, fontSize: 13 }}>
                {index + 1}
              </span>
              <img
                src={song.imageUrl || "/placeholder.jpg"}
                alt={song.title}
                style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>
                  {song.title}
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>
                  {song.artist}
                </p>
              </div>
              <Play size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSong(id, song._id);
                  setPlaylist((prev) => ({
                    ...prev,
                    songs: prev.songs.filter((s) => s._id !== song._id),
                  }));
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: "50%",
                  display: "flex",
                }}
                title="Xoá khỏi playlist"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}