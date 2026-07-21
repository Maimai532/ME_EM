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

export function normalizeArtistString(artistStr) {
  return joinArtists(splitArtists(artistStr));
}