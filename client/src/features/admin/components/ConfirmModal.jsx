import React, { useEffect } from "react";
import "../styles/ConfirmModal.css";

function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onConfirm, onCancel]);

  return (
    <div className="Confirm-overlay">
      <div className="Confirm-modal Confirm-modal--narrow">
        <p className="Confirm-modal__message">{message}</p>
        <div className="Confirm-modal__footer">
          <button
            type="button"
            className="Confirm__btn-cancel"
            onClick={onCancel}
          >
            Huỷ 
          </button>
          <button
            type="button"
            className=" Confirm__btn-save--danger"
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;