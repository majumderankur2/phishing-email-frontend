import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { registerTokensWithBackend } from "../services/gmailService";
import "./ConnectGmail.css";

// ─── How long to wait before giving up and going to dashboard ───
const TIMEOUT_SECONDS = 30;

const ConnectGmail = () => {
  const navigate = useNavigate();

  // "connecting" | "success" | "skipped" | "error"
  const [phase, setPhase]       = useState("connecting");
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);

  // ── Auto-redirect countdown (safety net if popup is blocked) ──
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/dashboard");
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  // ── Trigger Gmail OAuth as soon as the page loads ──
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerGmailConnect();
    }, 800); // small delay so the loading screen renders first
    return () => clearTimeout(timer);
  }, []);

  const triggerGmailConnect = () => {
    // Google Identity Services must be loaded (it's in index.html)
    if (!window.google?.accounts?.oauth2) {
      console.warn("Google Identity Services not loaded yet");
      setPhase("error");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      navigate("/");
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: "322981810425-9be448qvt1qple2gemghj5u4m8ni9ufc.apps.googleusercontent.com",
        scope: [
          "https://www.googleapis.com/auth/gmail.readonly",
          "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
        ux_mode: "popup",
        callback: async (response) => {
          if (response.error) {
            // User cancelled or denied — go to dashboard anyway
            console.warn("Gmail connect cancelled:", response.error);
            setPhase("skipped");
            setTimeout(() => navigate("/dashboard"), 2000);
            return;
          }

          try {
            // Register the auth code + FCM token with the backend
            await registerTokensWithBackend(user, response.code);
            setPhase("success");
            setTimeout(() => navigate("/dashboard"), 2000);
          } catch (err) {
            console.error("Token registration failed:", err);
            setPhase("error");
            setTimeout(() => navigate("/dashboard"), 3000);
          }
        },
      });

      client.requestCode();
    } catch (err) {
      console.error("Gmail OAuth init failed:", err);
      setPhase("error");
      setTimeout(() => navigate("/dashboard"), 3000);
    }
  };

  const handleSkip = () => navigate("/dashboard");

  // ── What to show based on phase ──
  const content = {
    connecting: {
      icon:    "🛡",
      title:   "Connecting Gmail Protection",
      message: "A Gmail permission popup should appear shortly.\nPlease click Allow to enable auto-scanning.",
      color:   "#00f5ff",
    },
    success: {
      icon:    "✅",
      title:   "Gmail Connected!",
      message: "Auto-scanning is now active.\nRedirecting to your dashboard...",
      color:   "#2dc56a",
    },
    skipped: {
      icon:    "⏭",
      title:   "Skipped for Now",
      message: "You can connect Gmail anytime from the Gmail Scan page.\nRedirecting to dashboard...",
      color:   "#f5a623",
    },
    error: {
      icon:    "⚠️",
      title:   "Connection Issue",
      message: "Something went wrong. You can connect Gmail later.\nRedirecting to dashboard...",
      color:   "#ff4d6d",
    },
  };

  const current = content[phase];

  return (
    <div className="cg-root">

      {/* Animated background particles */}
      <div className="cg-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="cg-particle"
            style={{
              left:            `${8 + i * 8}%`,
              animationDelay:  `${i * 0.4}s`,
              animationDuration:`${3 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="cg-card">

        {/* Corner brackets */}
        <div className="cg-corner cg-corner-tl" />
        <div className="cg-corner cg-corner-tr" />
        <div className="cg-corner cg-corner-bl" />
        <div className="cg-corner cg-corner-br" />

        {/* Brand */}
        <div className="cg-brand">
          <span>PhishMe</span><span className="cg-brand-not">Not</span><span> AI</span>
        </div>

        {/* Status icon */}
        <div className="cg-icon-wrap">
          <div className="cg-icon-glow" style={{ background: `radial-gradient(circle, ${current.color}33 0%, transparent 70%)` }} />
          <div className="cg-icon">{current.icon}</div>
          {phase === "connecting" && (
            <>
              <div className="cg-ring cg-ring-1" />
              <div className="cg-ring cg-ring-2" />
            </>
          )}
        </div>

        {/* Status text */}
        <h1 className="cg-title" style={{ color: current.color }}>
          {current.title}
        </h1>
        <p className="cg-message">
          {current.message}
        </p>

        {/* Spinner (only while connecting) */}
        {phase === "connecting" && (
          <div className="cg-spinner-wrap">
            <div className="cg-spinner" />
            <span className="cg-spinner-label">AWAITING PERMISSION...</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="cg-progress-track">
          <div
            className="cg-progress-fill"
            style={{
              width: `${((TIMEOUT_SECONDS - countdown) / TIMEOUT_SECONDS) * 100}%`,
              background: current.color,
            }}
          />
        </div>

        {/* Info row */}
        <div className="cg-info-row">
          <span className="cg-info-text">
            {phase === "connecting"
              ? `Auto-redirecting in ${countdown}s if no popup appears`
              : "Redirecting..."}
          </span>
        </div>

        {/* Skip button (only while connecting) */}
        {phase === "connecting" && (
          <button className="cg-skip-btn" onClick={handleSkip}>
            Skip for now — I'll connect Gmail later
          </button>
        )}

        {/* What this does */}
        {phase === "connecting" && (
          <div className="cg-features">
            <div className="cg-feature">
              <span className="cg-feature-icon">⚡</span>
              <span>Emails scanned automatically every 5 minutes</span>
            </div>
            <div className="cg-feature">
              <span className="cg-feature-icon">🔔</span>
              <span>Push notification if phishing is detected</span>
            </div>
            <div className="cg-feature">
              <span className="cg-feature-icon">🔒</span>
              <span>Read-only access — we never modify your emails</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ConnectGmail;