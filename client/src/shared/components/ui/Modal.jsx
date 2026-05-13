function Modal({ title = "Modal", children }) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default Modal;
