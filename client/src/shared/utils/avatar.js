const COLORS = [
  "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71",
  "#1abc9c", "#3498db", "#9b59b6", "#e91e63",
];

export function getAvatarColor(name = "") {
  if (!name) return COLORS[0];
  return COLORS[name.charCodeAt(0) % COLORS.length];
}