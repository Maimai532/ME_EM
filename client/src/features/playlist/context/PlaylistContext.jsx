import { createContext, useContext, useState, useCallback } from "react";
import * as playlistService from "../services/playlistService";
import { useToast } from "../../../shared/hooks/useToast";

const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const res = await playlistService.getMyPlaylists();
      // Log để xem cấu trúc thực tế
      console.log("playlist res:", res.data);

      const data = res.data?.data ?? res.data?.playlists ?? res.data;
      setPlaylists(Array.isArray(data) ? data : []);
    } catch {
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlaylist = async (name) => {
    const res = await playlistService.createPlaylist(name);
    const newPlaylist = res.data.data || res.data;
    setPlaylists((prev) => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const addSong = async (playlistId, songId) => {
    await playlistService.addSongToPlaylist(playlistId, songId);
    showToast("Đã thêm vào playlist!");
    fetchPlaylists();
  };

  const removeSong = async (playlistId, songId) => {
    await playlistService.removeSongFromPlaylist(playlistId, songId);
    showToast("Đã xoá khỏi playlist");
    fetchPlaylists();
  };

  const deletePlaylist = async (playlistId) => {
    await playlistService.deletePlaylist(playlistId);
    setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
    showToast("Đã xoá playlist");
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        loading,
        fetchPlaylists,
        createPlaylist,
        addSong,
        removeSong,
        deletePlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export const usePlaylist = () => useContext(PlaylistContext);
