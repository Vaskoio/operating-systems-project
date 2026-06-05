import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

const HERO = "https://images.unsplash.com/photo-1774677784803-fe0f6c9ce4ae?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwc29mdCUyMGdyYWRpZW50JTIwYmx1ciUyMHRleHR1cmV8ZW58MHx8fHwxNzc3NzUyMzk5fDA&ixlib=rb-4.1.0&q=85";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back!");
      nav("/app/swipe");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("ivan@crush.app");
    setPassword("password123");
    toast.success("Demo credentials filled — click Sign in");
  };

  return (
    <div className="auth">
      <div className="auth-hero" style={{ backgroundImage: `url("${HERO}")` }}>
        <div className="auth-hero-text">
          <h1>call me,<br />maybe.</h1>
          <p>Meet people near you. Match. Start something real — or just have a laugh.</p>
        </div>
      </div>
      <div className="auth-side">
        <div className="auth-box">
          <Link to="/" className="auth-brand">
            <Heart size={28} color="var(--primary)" strokeWidth={2.5} fill="currentColor" /> HeadOverHeels
          </Link>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-sub">Sign in to pick up where you left off.</p>

          <form onSubmit={submit} style={{ marginTop: 28 }} data-testid="login-form">
            <div className="form-group">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="input" placeholder="you@example.com"
                data-testid="login-email-input"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password" type="password" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="input" placeholder="••••••••"
                data-testid="login-password-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} data-testid="login-submit-btn">
              {loading && <Loader2 size={16} className="spin" />} Sign in
            </button>
          </form>

          <div className="divider"><span>Or</span></div>

          <button type="button" className="btn btn-outline btn-block" onClick={fillDemo} data-testid="use-demo-btn">
            Fill demo credentials
          </button>

          <p className="auth-footer">
            New here? <Link to="/register" data-testid="go-to-register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
