import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireAdmin } from "./ProtectedRoute";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import NavigationSetter from "../components/NavigationSetter.jsx";

import Auth from "../../features/auth/pages/Auth";
import Home from "../../features/home/pages/Home";
import Profile from "../../features/profile/pages/Profile";
import Playlist from "../../features/playlist/pages/Playlist";
import Library from "../../features/playlist/pages/Library";
import Search from "../../features/search/pages/Search";
import History from "../../features/history/pages/History.jsx";
import LikedSongs from "../../features/playlist/pages/LikedSongs";
import Artist from "../../features/artist/pages/Artist";

import Admin_Page from "../../features/admin/pages/Admin_Page";
import Admin_Song from "../../features/admin/pages/Admin_Song";
import Admin_User from "../../features/admin/pages/Admin_User";
import AdminLayout from "../layouts/AdminLayout";
import Admin_Artist from "../../features/admin/pages/Admin_Artist";
import Admin_Section from "../../features/admin/pages/Admin_Section";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <NavigationSetter />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/library"
            element={
              <RequireAuth>
                <Library />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="/search" element={<Search />} />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <History />
              </RequireAuth>
            }
          />
          <Route
            path="/playlist/:id"
            element={
              <RequireAuth>
                <Playlist />
              </RequireAuth>
            }
          />
          <Route
            path="/liked-songs"
            element={
              <RequireAuth>
                <LikedSongs />
              </RequireAuth>
            }
          />
          <Route path="/artist/:id" element={<Artist />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="song_admin" replace />} />
          <Route index element={<Admin_Page />} />
          <Route path="song_admin" element={<Admin_Song />} />
          <Route path="section_admin" element={<Admin_Section />} />
          <Route
            path="playlist_admin"
            element={<Navigate to="/admin/section_admin" replace />}
          />
          <Route path="user_admin" element={<Admin_User />} />
          <Route path="artist_admin" element={<Admin_Artist />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
