import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";
import { Eye, EyeOff } from "lucide-react";

function AuthPage({ mode = "login" }) {
  const isLogin = mode === "login";

  useEffect(() => {
    document.title = "Me_Em";
  }, [isLogin]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = isLogin
        ? await login(email, password)
        : await register(username, email, password);

      navigate(user.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isLogin ? "Đăng nhập thất bại" : "Đăng ký thất bại"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
       <div className="auth-left">
        <svg
          viewBox="0 0 1920 1080"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="auth-wave-svg"
        >
          <path
            d="M933 0L984.8 25.7C1036.7 51.3 1140.3 102.7 1147.3 154.2C1154.3 205.7 1064.7 257.3 1060.8 308.8C1057 360.3 1139 411.7 1130.8 463C1122.7 514.3 1024.3 565.7 971 617C917.7 668.3 909.3 719.7 958.3 771.2C1007.3 822.7 1113.7 874.3 1156 925.8C1198.3 977.3 1176.7 1028.7 1165.8 1054.3L1155 1080L0 1080L0 1054.3C0 1028.7 0 977.3 0 925.8C0 874.3 0 822.7 0 771.2C0 719.7 0 668.3 0 617C0 565.7 0 514.3 0 463C0 411.7 0 360.3 0 308.8C0 257.3 0 205.7 0 154.2C0 102.7 0 51.3 0 25.7L0 0Z"
            fill="#68c6ed"
          />
        </svg>

        <div className="auth-poster-overlay">
          <h2 className="auth-poster-title">
            <p>Listen</p>
            <p><span>and</span>Feel</p>
          </h2>
          <p className="auth-poster-desc">Trải nghiệm âm nhạc theo cách của bạn</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <img src="/logo2.png" alt="Logo" className="auth-logo" />
          <h1 className="auth-title">{isLogin ? "Đăng nhập" : "Đăng ký"}</h1>
          {/* <p className="auth-subtitle">
            {isLogin
              ? "Chào mừng bạn trở lại"
              : "Chào mừng bạn đến với chúng tôi"}
          </p> */}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="auth-password-wrapper">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button className="auth-btn-submit" disabled={loading}>
              {loading
                ? isLogin
                  ? "Đang đăng nhập..."
                  : "Đang đăng ký..."
                : isLogin
                  ? "Đăng nhập"
                  : "Đăng ký"}
            </Button>

            {error && <p className="auth-error">{error}</p>}

            <Link className="auth-link" to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Chưa có tài khoản ?" : "Đã có tài khoản ?"}
              <br />
              <h3>{isLogin ? "Đăng ký" : "Đăng nhập"}</h3>
            </Link>
          </form>

          <div className="auth-divider">
            <div className="auth-line" />
            <span>or</span>
            <div className="auth-line" />
          </div>

          <div className="auth-social">
            <button className="social-btn">
              <img src="/google.png" alt="Google" width={18} height={18} />
              {isLogin ? "Đăng nhập với Google" : "Đăng ký với Google"}
            </button>
            <button className="social-btn">
              <img src="/facebook.png" alt="facebook" width={18} height={18} />
              {isLogin ? "Đăng nhập với Facebook" : "Đăng ký với Facebook"}
            </button>
            <button className="social-btn">
              <img src="/apple.png" alt="apple" width={18} height={18} />
              {isLogin ? "Đăng nhập với Apple" : "Đăng ký với Apple"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
