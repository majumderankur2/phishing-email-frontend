import { useState, useEffect, useRef } from "react";
import { requestNotificationPermission, sendPhishingAlert } from "../firebase";
import { getGmailAccessToken, fetchUnreadEmails, fetchEmailContent, extractEmailBody, extractEmailHeaders, registerTokensWithBackend } from "../services/gmailService";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const BACKEND = "https://phishing-email-backend-7a45.onrender.com";
const SCAN_INTERVAL = 5 * 60;

export default function GmailScan() {
  const [status, setStatus] = useState("idle");
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [autoScan, setAutoScan] = useState(false);
  const [countdown, setCountdown] = useState(SCAN_INTERVAL);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [totalPhishing, setTotalPhishing] = useState(0);

  const accessTokenRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (autoScan) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            runScan(accessTokenRef.current);
            return SCAN_INTERVAL;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownRef.current);
      setCountdown(SCAN_INTERVAL);
    }
    return () => clearInterval(countdownRef.current);
  }, [autoScan]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const connectAndStart = async () => {
    try {
      setStatus("connecting");
      const token = await getGmailAccessToken();
      accessTokenRef.current = token;

      // Register tokens with backend for permanent background scanning
      const fcmToken = await requestNotificationPermission();
      await registerTokensWithBackend(auth.currentUser.uid, token, fcmToken);

      setAutoScan(true);
      await runScan(token);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect to Gmail");
      setStatus("error");
    }
  };

  const runScan = async (token) => {
    if (!token) return;
    try {
      setStatus("scanning");
      setProgress(0);

      const messageList = await fetchUnreadEmails(token, 10);

      if (messageList.length === 0) {
        setLastScanTime(new Date());
        setStatus("monitoring");
        return;
      }

      const results = [];
      let phishingCount = 0;

      for (let i = 0; i < messageList.length; i++) {
        const msg = await fetchEmailContent(token, messageList[i].id);
        const body = extractEmailBody(msg);
        const { subject, from, date } = extractEmailHeaders(msg);

        setCurrentEmail(subject);
        setProgress(Math.round(((i + 1) / messageList.length) * 100));

        if (!body.trim()) {
          results.push({ subject, from, date, verdict: "unknown", score: 0, skipped: true });
          continue;
        }

        const scanRes = await fetch(`${BACKEND}/api/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_text: body }),
        });
        const scanData = await scanRes.json();

        const verdict = scanData.verdict || scanData.label || "unknown";
        const score = scanData.score ?? 0;

        results.push({ subject, from, date, verdict, score, skipped: false });

        if (verdict === "phishing") {
          sendPhishingAlert(subject, Math.round(score));
          phishingCount++;
        }

        try {
          await addDoc(collection(db, "scans"), {
            uid: auth.currentUser.uid,
            subject, from, date, verdict, score,
            source: "gmail-auto",
            timestamp: serverTimestamp(),
          });
        } catch (e) {
          console.error("Firestore save error:", e);
        }
      }

      setEmails(results);
      setTotalPhishing(prev => prev + phishingCount);
      setLastScanTime(new Date());
      setStatus("monitoring");

    } catch (err) {
      console.error("Scan error:", err);
      setStatus("monitoring");
    }
  };

  const stopAutoScan = () => {
    setAutoScan(false);
    accessTokenRef.current = null;
    setStatus("idle");
    setEmails([]);
    setTotalPhishing(0);
  };

  const verdictColor = (v) => v === "phishing" ? "#ff4d6d" : v === "suspicious" ? "#ffaa00" : "#00f5ff";
  const verdictBg = (v) => v === "phishing" ? "rgba(255,77,109,0.15)" : v === "suspicious" ? "rgba(255,170,0,0.15)" : "rgba(0,245,255,0.05)";

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", color: "#e0f0ff", fontFamily: "Rajdhani, sans-serif", padding: "2rem" }}>
      <h1 style={{ color: "#00f5ff", fontSize: "2rem", marginBottom: "0.5rem" }}>📧 Gmail Auto-Scan</h1>
      <p style={{ color: "#7a9bbf", marginBottom: "2rem" }}>
        Connects to your Gmail and automatically scans for phishing every 5 minutes.
        Once connected, the backend monitors your inbox 24/7 even when this page is closed.
      </p>

      {status === "idle" && (
        <button onClick={connectAndStart} style={{
          background: "#00f5ff", color: "#080c10", border: "none",
          padding: "0.9rem 2.5rem", borderRadius: "8px", fontSize: "1.1rem",
          fontFamily: "Rajdhani, sans-serif", fontWeight: "700", cursor: "pointer"
        }}>
          🔍 Connect Gmail &amp; Start Auto-Scan
        </button>
      )}

      {status === "connecting" && (
        <div style={{ color: "#00f5ff" }}>⏳ Connecting to Gmail — check for a popup window...</div>
      )}

      {status === "scanning" && (
        <div>
          <div style={{ color: "#00f5ff", marginBottom: "0.5rem" }}>
            🔄 Scanning {progress}% — <em style={{ color: "#fff" }}>{currentEmail}</em>
          </div>
          <div style={{ background: "#0a1520", borderRadius: "8px", height: "12px", width: "400px", maxWidth: "100%" }}>
            <div style={{ background: "#00f5ff", height: "100%", borderRadius: "8px", width: `${progress}%`, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {status === "monitoring" && (
        <div>
          <div style={{
            background: "#0a1520", border: "1px solid rgba(0,245,255,0.2)",
            borderRadius: "10px", padding: "1.2rem 1.5rem", marginBottom: "1.5rem",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2dc56a", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#2dc56a", fontWeight: "700", fontSize: "1.1rem" }}>AUTO-SCAN ACTIVE</span>
              </div>
              <div style={{ color: "#7a9bbf", fontSize: "0.85rem" }}>
                Last scan: {lastScanTime ? lastScanTime.toLocaleTimeString() : "—"} &nbsp;|&nbsp;
                Next scan in: <span style={{ color: "#00f5ff", fontWeight: "700" }}>{formatCountdown(countdown)}</span>
              </div>
              <div style={{ color: "#3a6a80", fontSize: "0.8rem", marginTop: "4px" }}>
                ✅ Backend monitoring active — will scan even when browser is closed
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {totalPhishing > 0 && (
                <div style={{ color: "#ff4d6d", fontWeight: "700" }}>⚠️ {totalPhishing} phishing detected</div>
              )}
              <button onClick={stopAutoScan} style={{
                background: "transparent", color: "#ff4d6d",
                border: "1px solid rgba(255,77,109,0.4)", padding: "0.5rem 1.2rem",
                borderRadius: "6px", cursor: "pointer", fontFamily: "Rajdhani, sans-serif", fontWeight: "700"
              }}>
                ⏹ Stop
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "1rem", color: "#7a9bbf", fontSize: "0.9rem" }}>
            Last scan results — {emails.length} emails checked:
          </div>

          {emails.length === 0 && (
            <div style={{ color: "#3a6a80", fontFamily: "Share Tech Mono, monospace", fontSize: "0.85rem" }}>
              No unread emails found in last scan.
            </div>
          )}

          {emails.map((email, i) => (
            <div key={i} style={{
              background: verdictBg(email.verdict),
              border: `1px solid ${verdictColor(email.verdict)}`,
              borderRadius: "10px", padding: "1rem 1.2rem", marginBottom: "0.8rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: "700" }}>{email.subject}</div>
                  <div style={{ color: "#7a9bbf", fontSize: "0.85rem" }}>From: {email.from}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {email.skipped ? (
                    <span style={{ color: "#7a9bbf", fontSize: "0.85rem" }}>Skipped</span>
                  ) : (
                    <>
                      <div style={{ color: verdictColor(email.verdict), fontWeight: "700", textTransform: "uppercase" }}>
                        {email.verdict}
                      </div>
                      <div style={{ color: "#7a9bbf", fontSize: "0.85rem" }}>Score: {Math.round(email.score)}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "error" && (
        <div style={{ color: "#ff4d6d" }}>
          ❌ Error: {errorMsg}
          <br />
          <button onClick={() => setStatus("idle")} style={{
            marginTop: "1rem", background: "transparent", color: "#00f5ff",
            border: "1px solid #00f5ff", padding: "0.5rem 1.5rem",
            borderRadius: "6px", cursor: "pointer"
          }}>
            Try Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}