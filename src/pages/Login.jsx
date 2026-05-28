import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { ChevronsRight, LockKeyhole, ShieldCheck, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "../firebase";
import "./Login.css";

const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

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
      <div className="binary-rain" aria-hidden="true">
        <span>010101001101010101001101001010101011001010101010</span>
        <span>110010101001101010100101010110010101001010101101</span>
        <span>001101010110010101001010110101010011010101001010</span>
        <span>101001101010010101011001010100101010110010101010</span>
        <span>010110010101001010101101010010101001101010010101</span>
        <span>101010011010101001010101100101010010101011010010</span>
      </div>

      <div className="hud-note hud-note-left" aria-hidden="true">
        <span>SYSTEM_OK</span>
        <i />
        <i />
        <i />
      </div>

      <div className="hud-note hud-note-right" aria-hidden="true">
        <span>THREAT_LEVEL</span>
        <i />
        <i />
        <i />
      </div>

      <section className="login-panel" aria-label="Login to PhishMeNot AI">
        <div className="panel-corner panel-corner-top-left" />
        <div className="panel-corner panel-corner-top-right" />
        <div className="panel-corner panel-corner-bottom-left" />
        <div className="panel-corner panel-corner-bottom-right" />

        <div className="panel-dots" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <header className="brand-lockup">
          <div className="shield-mark" aria-hidden="true">
            <ShieldCheck size={74} strokeWidth={1.4} />
            <span className="shield-keyhole" />
          </div>

          <h1>
            PhishMe<span>Not</span> AI
          </h1>
        </header>

        <div className="version-row" aria-hidden="true">
          <i />
          <strong>VERSION v1.5X</strong>
          <i />
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="login-email">USER_ID</label>
          <div className="input-frame">
            <User className="input-icon" size={38} strokeWidth={1.5} />
            <input
              id="login-email"
              type="email"
              placeholder="operator@domain.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="login-password">ACCESS_KEY</label>
          <div className="input-frame">
            <LockKeyhole className="input-icon filled-icon" size={38} strokeWidth={1.5} />
            <input
              id="login-password"
              type="password"
              placeholder="************"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button className="start-button" type="submit" disabled={loading}>
            <span>{loading ? "INITIALIZING" : "START DETECTING"}</span>
            {loading ? <i className="loading-ring" /> : <ChevronsRight size={42} strokeWidth={2.4} />}
          </button>
        </form>

        <div className="divider">
          <i />
          <span>OR</span>
          <i />
        </div>

        <button
          className="google-button"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>AUTHENTICATE WITH GOOGLE</span>
        </button>

        <p className="signup-row">
          NO ACCOUNT?
          <Link to="/signup">SIGN UP</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
