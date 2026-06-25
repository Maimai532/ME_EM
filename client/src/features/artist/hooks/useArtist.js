import { useEffect, useState } from "react";
import { fetchArtistById } from "../services/artist.service";

export default function useArtistDetail(id) {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    fetchArtistById(id)
      .then((data) => setArtist(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { artist, loading, error };
}