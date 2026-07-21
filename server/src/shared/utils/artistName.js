/**
 * Util dùng chung để tách/ghép tên nhiều nghệ sĩ được lưu chung
 * trong 1 field string (Song.artist).
 *
 * Format chuẩn sau migration: "A, B, C" (phẩy + space).
 * splitArtists vẫn nhận diện các separator cũ (/, và) để đọc dữ liệu
 * legacy an toàn trong lúc migrate.
 */

export function splitArtists(artistStr) {
  if (!artistStr) return [];
  return artistStr
    .split(/,|\/| và /)
    .map((a) => a.trim())
    .filter(Boolean);
}

export function joinArtists(namesArray) {
  if (!Array.isArray(namesArray)) return "";
  return namesArray
    .map((a) => (a || "").trim())
    .filter(Boolean)
    .join(", ");
}

/** Chuẩn hoá 1 chuỗi artist bất kỳ về format chuẩn "A, B, C" */
export function normalizeArtistString(artistStr) {
  return joinArtists(splitArtists(artistStr));
}