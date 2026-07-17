import { useEffect, useState } from "react";
import { artistService } from "../../../shared/services/artist.service";

export default function useArtistDetail(id) {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    artistService
      .getById(id)
      .then((res) => setArtist(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { artist, loading, error };
}