// client/src/context/ToastContext.jsx
import { createContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Thêm toast mới vào danh sách
  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now(); // id unique theo thời gian

    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự xoá sau duration ms
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Vùng hiển thị */}
      <div className="toast-wrapper">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}