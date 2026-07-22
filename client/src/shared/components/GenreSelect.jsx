// File: client/src/shared/components/GenreSelect.jsx
import useGenres from "../hooks/useGenres";

const GenreSelect = ({ value, onChange, name = "genre" }) => {
  const { genres, loading } = useGenres();

  return (
    <select name={name} value={value} onChange={onChange} disabled={loading}>
      <option value="">-- Chọn thể loại --</option>
      {genres.map((genre) => (
        <option key={genre} value={genre}>
          {genre}
        </option>
      ))}
    </select>
  );
};

export default GenreSelect;