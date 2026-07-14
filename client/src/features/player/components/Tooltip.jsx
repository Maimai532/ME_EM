import { useRef, useState } from "react";
import "../styles/Tooltip.css";

export default function Tooltip({ label, shortcut, children, delay = 500 }) {
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  const onEnter = () => {
    timerRef.current = setTimeout(() => setShow(true), delay);
  };
  const onLeave = () => {
    clearTimeout(timerRef.current);
    setShow(false);
  };

  return (
    <div className="tooltip-wrapper" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {show && (
        <div className="tooltip-box">
          <span>{label}</span>
          {shortcut && <kbd>{shortcut}</kbd>}
        </div>
      )}
    </div>
  );
}