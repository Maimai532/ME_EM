import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Input, Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

function Playlist_Admin() {
  return <h1 className="text-2xl font-semibold">Playlist Admin</h1>
}

export default Playlist_Admin
