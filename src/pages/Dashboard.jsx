import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const BACKEND_URL = "https://phishing-email-backend-7a45.onrender.com";

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats]             = useState({ total: 0, threats: 0, cacheHits: 0, avgScore: 0 });
  const [engines, setEngines]         = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchEngineStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "scans"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const scans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const threats = scans.filter((s) => {
        const label = (s.label || s.verdict || "").toLowerCase();
        return label === "phishing" || label === "suspicious";
      }).length;

      const cacheHits = scans.filter((s) =>
        s.cache_hit === true || s.cached === true || s.from_cache === true
      ).length;

      const avgScore = scans.length > 0
        ? Math.round(scans.reduce((sum, s) => sum + (s.score || 0), 0) / scans.length)
        : 0;

      setStats({ total: scans.length, threats, cacheHits, avgScore });
      setRecentScans(scans.slice(0, 8));
    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchEngineStatus = async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/engines/status`);
      const data = await res.json();
      setEngines(data);
    } catch { /* silently fail */ }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const cacheHitRate = stats.total > 0 ? Math.round((stats.cacheHits / stats.total) * 100) : 0;
  const threatRate   = stats.total > 0 ? Math.round((stats.threats   / stats.total) * 100) : 0;

  const weekDays    = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekCounts  = Array(7).fill(0);
  const weekThreats = Array(7).fill(0);
  recentScans.forEach((s) => {
    if (s.timestamp?.toDate) {
      const day = s.timestamp.toDate().getDay();
      weekCounts[day]++;
      const lbl = (s.label || "").toLowerCase();
      if (lbl === "phishing" || lbl === "suspicious") weekThreats[day]++;
    }
  });
  const maxWeek = Math.max(...weekCounts, 1);

  return (
    <div className="db-root">

      <div className="db-header">
        <div className="db-brand">
          <div className="db-brand-shield">🛡</div>
          <span>PhishMe<em>Not</em> AI</span>
        </div>
        <div className="db-header-right">
          <div className="db-status">
            <div className="status-dot" />
            6 ENGINES ACTIVE
          </div>
          <button className="db-signout" onClick={handleSignOut}>SIGN OUT</button>
        </div>
      </div>

      <div className="db-nav">
        <span className="nav-item active">DASHBOARD</span>
        <a href="/scan"       className="nav-item">SCAN</a>
        <a href="/history"    className="nav-item">HISTORY</a>
        <a href="/reports"    className="nav-item">REPORTS</a>
        <a href="/settings"   className="nav-item">SETTINGS</a>
        <a href="/gmail-scan" className="nav-item">GMAIL SCAN</a>
      </div>

      <div className="db-body">
        <div className="db-page-title">// THREAT INTELLIGENCE OVERVIEW</div>

        <div className="cta-panel">
          <div>
            <div className="cta-title">Ready to scan a suspicious email?</div>
            <div className="cta-sub">GROQ · GROQ2 · COHERE · ML · RULES · URL — 6 ENGINES STANDING BY</div>
          </div>
          <div className="cta-buttons">
            <a href="/scan"       className="cta-btn">⚡ RUN SCAN</a>
            <a href="/gmail-scan" className="cta-btn cta-btn-green">📧 SCAN GMAIL</a>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-label">Total Scans</div>
            <div className="metric-value">{stats.total}</div>
            <div className="metric-sub">All time · your account</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Threats Caught</div>
            <div className="metric-value red">{stats.threats}</div>
            <div className="metric-sub">{threatRate}% of all scans</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Cache Hit Rate</div>
            <div className="metric-value amber">{cacheHitRate}%</div>
            <div className="metric-sub">Redis · Upstash · 24hr TTL</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Avg Risk Score</div>
            <div className="metric-value green">{stats.avgScore}%</div>
            <div className="metric-sub">Across all scans</div>
          </div>
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-title">RECENT SCANS</div>
            {loadingData ? (
              <div className="loading-row">
                <div className="mini-spinner" />
                LOADING SCAN HISTORY...
              </div>
            ) : recentScans.length === 0 ? (
              <div className="empty-state">NO SCANS YET — RUN YOUR FIRST SCAN</div>
            ) : (
              recentScans.map((scan) => {
                const isPhish =
                  (scan.label || scan.verdict || "").toLowerCase() === "phishing" ||
                  (scan.label || scan.verdict || "").toLowerCase() === "suspicious";
                return (
                  <div className="scan-row" key={scan.id}>
                    <span className={`verdict-badge ${isPhish ? "phish" : "safe"}`}>
                      {isPhish ? "PHISH" : "SAFE"}
                    </span>
                    <span className="scan-email">{scan.email_preview || "—"}</span>
                    {(scan.cache_hit || scan.cached || scan.from_cache) && (
                      <span className="cached-badge">⚡</span>
                    )}
                    <span className="scan-score" style={{ color: isPhish ? "#ff4d6d" : "#2dc56a" }}>
                      {Math.round(scan.score ?? 0)}%
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="panel">
            <div className="panel-title">ENGINE STATUS</div>
            {[
              { name: "GROQ AI",  pct: "93%", green: false },
              { name: "GROQ2",    pct: "89%", green: false },
              { name: "COHERE",   pct: "91%", green: false },
              { name: "ML MODEL", pct: "87%", green: true  },
              { name: "RULES",    pct: "79%", green: true  },
              { name: "URL SCAN", pct: "82%", green: true  },
            ].map((e) => (
              <div className="engine-row" key={e.name}>
                <div className="engine-name">{e.name}</div>
                <div className="bar-track">
                  <div className={`bar-fill ${e.green ? "green" : ""}`}
                    style={{ width: engines ? e.pct : "0%" }} />
                </div>
                <div className="engine-pct" style={{ color: e.green ? "#2dc56a" : "#00f5ff" }}>
                  {engines ? e.pct : "—"}
                </div>
              </div>
            ))}
            <div className="panel-title" style={{ marginTop: "18px" }}>WEEKLY ACTIVITY</div>
            <div className="chart-area">
              {weekDays.map((day, i) => (
                <div className="chart-bar-col" key={day}>
                  <div className="chart-bar threats"
                    style={{ height: `${(weekThreats[i] / maxWeek) * 70}px` }} />
                  <div className="chart-bar total"
                    style={{ height: `${Math.max((weekCounts[i] / maxWeek) * 70, 4)}px` }} />
                  <div className="chart-day">{day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">DETECTION BREAKDOWN</div>
          <div className="threat-rate-wrap">
            <div className="threat-rate-label">
              <span>PHISHING / SUSPICIOUS</span>
              <span className="label-red">{stats.threats} scans ({threatRate}%)</span>
            </div>
            <div className="threat-rate-track">
              <div className="threat-rate-fill" style={{ width: `${threatRate}%` }} />
            </div>
            <div className="threat-rate-label">
              <span>SAFE EMAILS</span>
              <span className="label-green">{stats.total - stats.threats} scans ({100 - threatRate}%)</span>
            </div>
            <div className="threat-rate-track">
              <div className="safe-rate-fill" style={{ width: `${stats.total > 0 ? 100 - threatRate : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;