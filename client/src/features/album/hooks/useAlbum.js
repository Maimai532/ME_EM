import { useEffect, useState } from "react";
import { albumService } from "../../../shared/services/album.service";

export default function useAlbumDetail(id) {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchAlbum = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await albumService.getById(id);
        setAlbum(data);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  return { album, loading, error };
}