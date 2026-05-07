function Button({ children, type = 'button' }) {
  return (
    <button type={type} className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-slate-950">
      {children}
    </button>
  )
}

export default Button
