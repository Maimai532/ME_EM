import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="border-r border-slate-800 p-4">
      <nav className="space-y-2">
        <Link to="/" className="block">Home</Link>
        <Link to="/search" className="block">Search</Link>
        <Link to="/library" className="block">Library</Link>
      </nav>
    </aside>
  )
}

export default Sidebar
