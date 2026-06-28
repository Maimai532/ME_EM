// client/src/shared/components/ui/Toast.jsx
import "./../styles/Toast.css";

const TYPE_ICONS = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

export default function Toast({ toast }) {
  const { message, type = "success" } = toast;
  const safeType = TYPE_ICONS[type] ? type : "success";
  const icon = TYPE_ICONS[safeType];

  return (
    <div className={`toast toast--${safeType}`}>
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
}
