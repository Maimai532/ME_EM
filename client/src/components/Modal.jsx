function Modal({ title = 'Modal', children }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div>{children}</div>
    </div>
  )
}

export default Modal
