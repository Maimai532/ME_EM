// client/src/shared/hooks/useGenres.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constants/api";

const useGenres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/songs/genres`)
      .then((res) => {
        const data = res.data.genres;
        setGenres(Array.isArray(data) ? data : []);
      })
      .catch(() => setGenres([]))
      .finally(() => setLoading(false));
  }, []);

  return { genres, loading };
};

export default useGenres;