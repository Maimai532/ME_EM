import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Login.css";

function Login() {
  useEffect(() => {
    document.title = "Login";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") navigate("/admin");
      else navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* BÊN TRÁI - POSTER */}
      <div className="login-poster">
        <img src="/poster.svg" alt="poster" className="login-poster-img" />
        <div className="login-poster-overlay">
          <span className="login-poster-tag">Me_EM Music</span>
          <h2 className="login-poster-title">
            Nghe nhạc <br />
            bằng cả tâm hồn
          </h2>
          <p className="login-poster-desc">
            Hàng triệu bài hát, không quảng cáo. <br />
            Trải nghiệm âm nhạc theo cách của bạn.
          </p>
        </div>
      </div>

      {/* BÊN PHẢI - FORM */}
      <div className="login-right">
        <div className="login-box">
          <h1 className="login-title">Đăng nhập</h1>
          <p className="login-subtitle">Chào mừng bạn trở lại </p>

          <form onSubmit={handleSubmit} className="login-form">
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

            <Button type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            {error && <p className="login-error">{error}</p>}

            <Link to="/register" className="login-link">
              Chưa có tài khoản ?
              <br />
              <h3>Đăng ký</h3>
            </Link>
          </form>

          <div className="login-divider">
            <div className="login-line" />
            <span>or</span>
            <div className="login-line" />
          </div>

          <div className="login-social">
            <button className="social-btn" >
              <img src="/google.png" alt="Google" width={18} height={18} />
              Đăng nhập với Google
            </button>
            <button className="social-btn">
              <img src="/github.png" alt="GitHub" width={18} height={18} />
              Đăng nhập với GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
