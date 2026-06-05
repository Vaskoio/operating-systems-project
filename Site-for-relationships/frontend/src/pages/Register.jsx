import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

const GENDERS = [
  { v: "female", l: "Woman" },
  { v: "male", l: "Man" },
  { v: "nonbinary", l: "Non-binary" },
];
const INTERESTS = [
  { v: "female", l: "Women" },
  { v: "male", l: "Men" },
  { v: "everyone", l: "Everyone" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({
    email: "", password: "", name: "", birthdate: "",
    gender: "", interestedIn: "",
  });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const next = () => {
    if (step === 0) {
      if (!f.email || f.password.length < 6) return toast.error("Valid email & password (6+) required");
    }
    if (step === 1) {
      if (!f.name || !f.birthdate) return toast.error("Name & birthdate required");
      const y = new Date().getFullYear() - new Date(f.birthdate).getFullYear();
      if (y < 18) return toast.error("You must be at least 18");
    }
    setStep((s) => s + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(f);
      toast.success("Welcome to spark!");
      nav("/app/swipe");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "var(--bg)" }}>
      <header style={{ padding: "28px 24px 0" }}>
        <Link to="/login" className="auth-brand">
          <Heart size={26} color="var(--primary)" strokeWidth={2.5} fill="currentColor" /> HeadOverHeels
        </Link>
      </header>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", minHeight: "calc(100vh - 80px)" }}>
        <form onSubmit={submit} className="auth-box" data-testid="register-form">
          <div className="progress">
            {[0, 1, 2].map((i) => <div key={i} className={`progress-dot ${i <= step ? "active" : ""}`} />)}
          </div>

          {step === 0 && (
            <>
              <h2 className="auth-title">Create account</h2>
              <p className="auth-sub">We'll keep your info secret, pinky promise.</p>
              <div style={{ marginTop: 24 }}>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input type="email" required className="input" value={f.email}
                         onChange={(e) => set("email", e.target.value)} data-testid="reg-email-input" />
                </div>
                <div className="form-group">
                  <label className="label">Password <span className="label-hint">(min 6)</span></label>
                  <input type="password" required minLength={6} className="input" value={f.password}
                         onChange={(e) => set("password", e.target.value)} data-testid="reg-password-input" />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="auth-title">About you</h2>
              <div style={{ marginTop: 24 }}>
                <div className="form-group">
                  <label className="label">First name</label>
                  <input required className="input" value={f.name}
                         onChange={(e) => set("name", e.target.value)} data-testid="reg-name-input" />
                </div>
                <div className="form-group">
                  <label className="label">Birthdate</label>
                  <input type="date" required className="input" value={f.birthdate}
                         onChange={(e) => set("birthdate", e.target.value)} data-testid="reg-birthdate-input" />
                  <span className="label-hint">You must be at least 18.</span>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="auth-title">You &amp; who you like</h2>
              <div style={{ marginTop: 24 }}>
                <div className="form-group">
                  <label className="section-title">I am a</label>
                  <div className="choice-grid">
                    {GENDERS.map((o) => (
                      <button type="button" key={o.v}
                              className={`choice ${f.gender === o.v ? "active" : ""}`}
                              onClick={() => set("gender", o.v)}
                              data-testid={`reg-gender-${o.v}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="section-title">Show me</label>
                  <div className="choice-grid">
                    {INTERESTS.map((o) => (
                      <button type="button" key={o.v}
                              className={`choice ${f.interestedIn === o.v ? "active" : ""}`}
                              onClick={() => set("interestedIn", o.v)}
                              data-testid={`reg-interested-${o.v}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="row-between" style={{ marginTop: 32 }}>
            <button type="button" className="btn btn-ghost"
                    onClick={() => (step === 0 ? nav("/login") : setStep((s) => s - 1))}
                    data-testid="reg-back-btn">
              <ArrowLeft size={16} /> {step === 0 ? "Sign in instead" : "Back"}
            </button>
            {step < 2 ? (
              <button type="button" className="btn btn-primary" onClick={next} data-testid="reg-next-btn">
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading} data-testid="reg-submit-btn">
                {loading && <Loader2 size={16} className="spin" />} Create account
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
