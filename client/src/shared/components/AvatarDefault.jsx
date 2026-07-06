import { getAvatarColor } from "../utils/avatar";

function AvatarDefault({ name, size = 88 }) {
  const displayName = name || "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: getAvatarColor(displayName),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 500,
        color: "#fff",
        border: "2.5px solid #2e595f",
        flexShrink: 0,
      }}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}

export default AvatarDefault;