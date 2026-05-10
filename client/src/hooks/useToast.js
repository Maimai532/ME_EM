// client/src/hooks/useToast.js
import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast phải dùng trong ToastProvider");
  return context;
}