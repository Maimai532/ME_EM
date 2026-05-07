import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Player from '../components/Player'
import Sidebar from '../components/Sidebar'

//Lắp ráp giao diện chính của app: Navbar + Sidebar + Player + Outlet

function MainLayout() {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-slate-950 text-slate-100">
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr]">
        <Sidebar />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Player />
    </div>
  )
}

export default MainLayout
