import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const styles = {
  error: {
    color: "#f87171",
    fontSize: "14px",
    textAlign: "center",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#9ca3af",
    fontSize: "13px",
  },
  line: {
    flex: 1,
    height: "1px",
    backgroundColor: "#374151",
  },
  socialBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #374151",
    backgroundColor: "#111827",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
};

function Register() {
  useEffect(() => { document.title = "Register"; }, []);

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(username, email, password);
      if (user.role === "admin") navigate("/admin");
      else navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-white text-2xl font-bold text-center mb-6">Đăng ký</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)} />
          <Input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Mật khẩu" value={password}
            onChange={(e) => setPassword(e.target.value)} />

          {error && <p style={styles.error}>{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>

          <Link to="/login" className="text-sm text-blue-400 hover:underline text-center">
            Đã có tài khoản? Đăng nhập
          </Link>
        </form>

        {/* Divider */}
        <div style={{ ...styles.divider, margin: "20px 0" }}>
          <div style={styles.line} />
          <span>hoặc</span>
          <div style={styles.line} />
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-3">
          <button style={styles.socialBtn} disabled>
            <img src="/google.png" alt="Google" width={18} height={18} />
            Đăng ký với Google
          </button>
          <button style={styles.socialBtn} disabled>
            <img src="/github.png" alt="GitHub" width={18} height={18} />
            Đăng ký với GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;