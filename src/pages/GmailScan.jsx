import { useState, useEffect } from "react";
import { requestNotificationPermission, sendPhishingAlert } from "../firebase";
import { getGmailAccessToken, fetchUnreadEmails, fetchEmailContent, extractEmailBody, extractEmailHeaders } from "../services/gmailService";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const BACKEND = "https://phishing-email-backend-7a45.onrender.com";

export default function GmailScan() {
  const [status, setStatus] = useState("idle"); // idle | connecting | scanning | done | error
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    requestNotificationPermission();
  }, []);
  const startScan = async () => {
    try {
      setStatus("connecting");
      setEmails([]);
      setProgress(0);

      // Step 1: Get Gmail access token
      const accessToken = await getGmailAccessToken();

      // Step 2: Fetch unread email list
      setStatus("scanning");
      const messageList = await fetchUnreadEmails(accessToken, 10);

      if (messageList.length === 0) {
        setStatus("done");
        return;
      }

      const results = [];

      // Step 3: Scan each email
      for (let i = 0; i < messageList.length; i++) {
        const msg = await fetchEmailContent(accessToken, messageList[i].id);
        const body = extractEmailBody(msg);
        const { subject, from, date } = extractEmailHeaders(msg);

        setCurrentEmail(subject);
        setProgress(Math.round(((i + 1) / messageList.length) * 100));

        if (!body.trim()) {
          results.push({ subject, from, date, verdict: "unknown", score: 0, skipped: true });
          continue;
        }

        // Step 4: Send to your backend for scanning
        const scanRes = await fetch(`${BACKEND}/api/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_text: body }),
        });
        const scanData = await scanRes.json();

        const verdict = scanData.verdict || scanData.label || "unknown";
        const score = scanData.score ?? 0;
        // Trigger notification if phishing detected
        if (verdict === "phishing") {
          sendPhishingAlert(subject, Math.round(score));
        }
        
        const result = {
          subject,
          from,
          date,
          verdict,
          score,
          skipped: false,
        };

        results.push(result);

        // Step 5: Save to Firestore
        await addDoc(collection(db, "scans"), {
          uid: auth.currentUser.uid,
          subject,
          from,
          date,
          verdict,
          score,
          source: "gmail",
          timestamp: serverTimestamp(),
        });
      }

      setEmails(results);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  const verdictColor = (verdict) => {
    if (verdict === "phishing") return "#ff4d6d";
    if (verdict === "suspicious") return "#ffaa00";
    return "#00f5ff";
  };

  const verdictBg = (verdict) => {
    if (verdict === "phishing") return "rgba(255,77,109,0.15)";
    if (verdict === "suspicious") return "rgba(255,170,0,0.15)";
    return "rgba(0,245,255,0.10)";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", color: "#e0f0ff", fontFamily: "Rajdhani, sans-serif", padding: "2rem" }}>
      <h1 style={{ color: "#00f5ff", fontSize: "2rem", marginBottom: "0.5rem" }}>📧 Gmail Auto-Scan</h1>
      <p style={{ color: "#7a9bbf", marginBottom: "2rem" }}>
        Connects to your Gmail and scans your latest unread emails through all 6 AI engines.
      </p>

      {status === "idle" && (
        <button onClick={startScan} style={{
          background: "#00f5ff", color: "#080c10", border: "none",
          padding: "0.9rem 2.5rem", borderRadius: "8px", fontSize: "1.1rem",
          fontFamily: "Rajdhani, sans-serif", fontWeight: "700", cursor: "pointer"
        }}>
          🔍 Connect Gmail &amp; Scan
        </button>
      )}

      {status === "connecting" && (
        <div style={{ color: "#00f5ff" }}>⏳ Connecting to Gmail — check for a popup window...</div>
      )}

      {status === "scanning" && (
        <div>
          <div style={{ color: "#00f5ff", marginBottom: "0.5rem" }}>
            🔄 Scanning {progress}% — checking: <em style={{ color: "#fff" }}>{currentEmail}</em>
          </div>
          <div style={{ background: "#0a1520", borderRadius: "8px", height: "12px", width: "400px", maxWidth: "100%" }}>
            <div style={{ background: "#00f5ff", height: "100%", borderRadius: "8px", width: `${progress}%`, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={{ color: "#ff4d6d" }}>
          ❌ Error: {errorMsg}
          <br />
          <button onClick={() => setStatus("idle")} style={{ marginTop: "1rem", background: "transparent", color: "#00f5ff", border: "1px solid #00f5ff", padding: "0.5rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}>
            Try Again
          </button>
        </div>
      )}

      {status === "done" && (
        <div>
          <div style={{ color: "#00f5ff", marginBottom: "1.5rem" }}>
            ✅ Scan complete — {emails.length} emails checked
            <button onClick={() => setStatus("idle")} style={{ marginLeft: "1rem", background: "transparent", color: "#7a9bbf", border: "1px solid #7a9bbf", padding: "0.3rem 1rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
              Scan Again
            </button>
          </div>

          {emails.length === 0 && <p style={{ color: "#7a9bbf" }}>No unread emails found.</p>}

          {emails.map((email, i) => (
            <div key={i} style={{
              background: verdictBg(email.verdict),
              border: `1px solid ${verdictColor(email.verdict)}`,
              borderRadius: "10px", padding: "1.2rem", marginBottom: "1rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>{email.subject}</div>
                  <div style={{ color: "#7a9bbf", fontSize: "0.85rem" }}>From: {email.from}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {email.skipped ? (
                    <span style={{ color: "#7a9bbf", fontSize: "0.85rem" }}>Skipped (empty body)</span>
                  ) : (
                    <>
                      <div style={{ color: verdictColor(email.verdict), fontWeight: "700", fontSize: "1.1rem", textTransform: "uppercase" }}>
                        {email.verdict}
                      </div>
                      <div style={{ color: "#7a9bbf", fontSize: "0.85rem" }}>Score: {email.score}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}