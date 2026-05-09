import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const styles = {
  box: {
    padding: "20px",
    backgroundColor: "#1f2937",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid #4e4e95",
  },
  Title: {
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  error: {
    color: "#f87171",
    fontSize: "14px",
    textAlign: "center",
  },
};

function Login() {
  useEffect(() => { document.title = "Login"; }, []);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      // Điều hướng theo role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div style={styles.box}>
        <h1 style={styles.Title}>Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Hiện lỗi nếu có */}
          {error && <p style={styles.error}>{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <Link to="/register" className="text-sm text-blue-400 hover:underline text-center">
            Chưa có tài khoản? Đăng ký
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;