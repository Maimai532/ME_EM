import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Input, Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

function Song_Admin() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Song Admin</h1>
    </div>
  );
}

export default Song_Admin
