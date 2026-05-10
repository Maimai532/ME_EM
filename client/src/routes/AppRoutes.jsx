import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireAdmin } from "./ProtectedRoute";

import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Playlist from "../pages/Playlist";
import Library from "../pages/Library";
import MusicPlayer from "../pages/MusicPlayer";

import Admin from "../pages/Admin";
import Admin_Playlist from "../pages/Admin_Playlist";
import Admin_Song from "../pages/Admin_Song";
import Admin_User from "../pages/Admin_User";
import AdminLayout from "../layouts/AdminLayout";
import PlayerBar from "../components/ui/PlayerBar"; // thêm import

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/library" element={<Library />} />
          <Route path="/favorite" element={<Library />} />
          <Route path="/history" element={<Library />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="/playlist" element={<Playlist />} />

          <Route path="/player/:id" element={<MusicPlayer />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Admin />} />
          <Route path="song_admin" element={<Admin_Song />} />
          <Route path="playlist_admin" element={<Admin_Playlist />} />
          <Route path="user_admin" element={<Admin_User />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* PlayerBar phải nằm trong BrowserRouter để dùng được <Link> */}
      <PlayerBar />
    </BrowserRouter>
  );
};

export default AppRoutes;