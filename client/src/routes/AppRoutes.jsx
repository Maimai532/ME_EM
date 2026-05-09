import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireAdmin } from "./ProtectedRoute";

import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Playlist from "../pages/Playlist";
import Library from "../pages/Library";
import MusicPlayerPage from "../pages/MusicPlayerPage";

import Admin from "../pages/Admin";
import Playlist_Admin from "../pages/Playlist_Admin";
import Song_Admin from "../pages/Song_Admin";
import User_Admin from "../pages/User_Admin";
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

          <Route path="/player/:id" element={<MusicPlayerPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Admin />} />
          <Route path="song_admin" element={<Song_Admin />} />
          <Route path="playlist_admin" element={<Playlist_Admin />} />
          <Route path="user_admin" element={<User_Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* PlayerBar phải nằm trong BrowserRouter để dùng được <Link> */}
      <PlayerBar />
    </BrowserRouter>
  );
};

export default AppRoutes;