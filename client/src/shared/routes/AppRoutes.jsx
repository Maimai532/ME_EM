import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireAdmin } from "./ProtectedRoute";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import Home from "../../features/home/pages/Home";
import Profile from "../../features/profile/pages/Profile";
import Playlist from "../../features/playlist/pages/Playlist";
import Library from "../../features/library/pages/Library";
import Search from "../../features/search/pages/Search";
import History from "../../features/history/pages/History.jsx";
import LikedSongs from "../../features/library/pages/LikedSongs";

import Admin_Page from "../../features/admin/pages/Admin_Page";
import Admin_Playlist from "../../features/admin/pages/Admin_Playlist";
import Admin_Song from "../../features/admin/pages/Admin_Song";
import Admin_User from "../../features/admin/pages/Admin_User";
import AdminLayout from "../layouts/AdminLayout";
import Admin_Artist from "../../features/admin/pages/Admin_Artist";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/library" element={<Library />} />
          <Route path="/favorite" element={<Library />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/history" element={<History />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/liked-songs" element={<LikedSongs />} />
        </Route>

        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Navigate to="song_admin" replace />} />
          <Route index element={<Admin_Page />} />
          <Route path="song_admin" element={<Admin_Song />} />
          <Route path="playlist_admin" element={<Admin_Playlist />} />
          <Route path="user_admin" element={<Admin_User />} />
          <Route path="artist_admin" element={<Admin_Artist />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;