// client/src/shared/context/ToastContext.jsx
import { createContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Thêm toast mới vào danh sách
  const showToast = useCallback((message, type = "success", duration = 1500) => {
    const id = Date.now();
                                                 
    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự xoá sau duration ms
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-wrapper">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
