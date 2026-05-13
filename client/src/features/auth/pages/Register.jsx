import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  useEffect(() => {
    document.title = "Register";
  }, []);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="register-page">
      {/* BÊN TRÁI - POSTER */}
      <div className="register-poster">
        <img src="/poster.svg" alt="poster" className="register-poster-img" />
        <div className="register-poster-overlay">
          <span className="register-poster-tag">Me_EM Music</span>
          <h2 className="register-poster-title">
            Nghe nhạc <br />
            bằng cả tâm hồn
          </h2>
          <p className="register-poster-desc">
            Hàng triệu bài hát, không quảng cáo. <br />
            Trải nghiệm âm nhạc theo cách của bạn.
          </p>
        </div>
      </div>

      {/* BÊN PHẢI - FORM */}
      <div className="register-right">
        <div className="register-box">
          <h1 className="register-title">Đăng ký</h1>
          <p className="register-subtitle">Chào mừng bạn đến với chúng tôi</p>

          <form onSubmit={handleSubmit} className="register-form">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>

            {error && <p className="register-error">{error}</p>}

            <Link to="/login" className="register-link">
              Đã có tài khoản ?
              <br />
              <h3>Đăng nhập</h3>
            </Link>
          </form>

          <div className="register-divider">
            <div className="register-line" />
            <span>or</span>
            <div className="register-line" />
          </div>

          <div className="register-social">
            <button className="social-btn" >
              <img src="/google.png" alt="Google" width={18} height={18} />
              Đăng ký với Google
            </button>
            <button className="social-btn" >
              <img src="/github.png" alt="GitHub" width={18} height={18} />
              Đăng ký với GitHub
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Register;
