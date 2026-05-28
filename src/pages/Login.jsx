import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./Login.css";

const provider = new GoogleAuthProvider();

// Static binary rain columns — generated once, never causes re-renders
const RAIN_COLS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  chars: Array.from({ length: 40 }, () => Math.round(Math.random())).join(""),
  left: `${(i / 22) * 100}%`,
  duration: `${7 + (i % 7) * 1.4}s`,
  delay:    `${-(i % 11) * 0.9}s`,
  opacity:  0.055 + (i % 5) * 0.022,
  size:     10 + (i % 3),
}));

// Inline eye icon — no extra library needed
const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">

      {/* ── BINARY RAIN ── */}
      <div className="binary-rain" aria-hidden="true">
        {RAIN_COLS.map((col) => (
          <span
            key={col.id}
            className="rain-col"
            style={{
              left:              col.left,
              animationDuration: col.duration,
              animationDelay:    col.delay,
              opacity:           col.opacity,
              fontSize:          `${col.size}px`,
            }}
          >
            {col.chars}
          </span>
        ))}
      </div>

      {/* ── HUD CORNER DECORATIONS ── */}
      <div className="hud-note hud-note-left" aria-hidden="true">
        <span>SYSTEM_OK</span>
        <i /><i /><i />
      </div>
      <div className="hud-note hud-note-right" aria-hidden="true">
        <span>THREAT_LEVEL</span>
        <i /><i /><i />
      </div>

      {/* ── MAIN LOGIN PANEL ── */}
      <section className="login-panel" aria-label="Login to PhishMeNot AI">

        {/* Glowing corner brackets */}
        <div className="panel-corner panel-corner-tl" />
        <div className="panel-corner panel-corner-tr" />
        <div className="panel-corner panel-corner-bl" />
        <div className="panel-corner panel-corner-br" />

        {/* ── SHIELD ICON ── */}
        <div className="shield-wrap" aria-hidden="true">
          <div className="shield-glow" />
          <div className="shield-icon">🛡</div>
          <div className="shield-ring-a" />
          <div className="shield-ring-b" />
        </div>

        {/* ── BRAND NAME ── */}
        <h1 className="brand-name">
          PhishMe<span className="brand-not">Not</span><span className="brand-ai">.AI</span>
        </h1>

        {/* ── VERSION ── */}
        <div className="version-row">
          <i /><strong>VERSION v1.5X</strong><i />
        </div>

        {/* ── LOGIN FORM ── */}
        <form className="login-form" onSubmit={handleLogin}>

          {/* USER ID */}
          <label htmlFor="login-email" className="field-label">
            <svg className="label-icon" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            USER_ID
          </label>
          <div className="input-frame">
            <input
              id="login-email"
              type="email"
              placeholder="operator@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* ACCESS KEY */}
          <label htmlFor="login-password" className="field-label" style={{ marginTop: "16px" }}>
            <svg className="label-icon" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            ACCESS_KEY
          </label>
          <div className="input-frame">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {/* START DETECTING BUTTON */}
          <button className="start-button" type="submit" disabled={loading}>
            {/* Animated radar icon */}
            <div className="radar-wrap" aria-hidden="true">
              <div className="radar-dot" />
              <div className="radar-ring-1" />
              <div className="radar-ring-2" />
              <div className="radar-sweep" />
            </div>
            <span className="start-label">
              {loading ? "INITIALIZING..." : "START DETECTING"}
            </span>
            <span className="start-arrow">›</span>
          </button>

        </form>

        {/* ── OR DIVIDER ── */}
        <div className="or-divider"><i /><span>OR</span><i /></div>

        {/* ── GOOGLE BUTTON ── */}
        <button
          className="google-button"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="google-label">AUTHENTICATE WITH GOOGLE</span>
          <span className="start-arrow">›</span>
        </button>

        {/* ── SIGNUP LINK ── */}
        <p className="signup-row">
          NO ACCOUNT?&nbsp;<Link to="/signup">SIGN UP ›</Link>
        </p>

      </section>
    </main>
  );
};

export default Login;