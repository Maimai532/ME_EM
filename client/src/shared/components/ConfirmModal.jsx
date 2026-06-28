import "./../styles/ConfirmModal.css";

const ConfirmModal = ({ isOpen, title, message, cancel, confirm, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>{cancel}</button>
          <button className="btn-confirm" onClick={onConfirm}>{confirm}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;