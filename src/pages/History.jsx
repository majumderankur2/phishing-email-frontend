import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "./History.css";

const History = () => {
  const navigate = useNavigate();
  const [scans, setScans]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { applyFilter(filter); }, [scans, filter]);

  const fetchHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "scans"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setScans(data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (f) => {
    if (f === "all")      return setFiltered(scans);
    if (f === "phishing") return setFiltered(scans.filter((s) => s.label === "phishing" || s.label === "suspicious"));
    if (f === "safe")     return setFiltered(scans.filter((s) => s.label === "safe"));
    if (f === "cached")   return setFiltered(scans.filter((s) => s.cache_hit === true));
  };

  const formatDate = (ts) => {
    if (!ts?.toDate) return "—";
    const d = ts.toDate();
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      + "  " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const threats = scans.filter((s) => s.label === "phishing" || s.label === "suspicious").length;
  const cached  = scans.filter((s) => s.cache_hit).length;

  return (
    <div className="hist-root">

      {/* ── HEADER ── */}
      <div className="hist-header">
        <div className="hist-brand">
          <div className="hist-brand-shield">🛡</div>
          <span>PhishMe<em>Not</em> AI</span>
        </div>
        <div className="hist-header-right">
          <div className="hist-status">
            <div className="status-dot" />
            6 ENGINES ACTIVE
          </div>
          <button className="hist-signout" onClick={handleSignOut}>SIGN OUT</button>
        </div>
      </div>

      {/* ── NAV ── */}
      <div className="hist-nav">
        <a href="/dashboard"  className="nav-item">DASHBOARD</a>
        <a href="/scan"       className="nav-item">SCAN</a>
        <span className="nav-item active">HISTORY</span>
        <a href="/reports"    className="nav-item">REPORTS</a>
        <a href="/settings"   className="nav-item">SETTINGS</a>
        <a href="/gmail-scan" className="nav-item">GMAIL SCAN</a>
      </div>

      {/* ── BODY ── */}
      <div className="hist-body">
        <div className="hist-page-title">// MY SCAN HISTORY</div>

        {/* ── SUMMARY CARDS ── */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Total Scans</div>
            <div className="summary-value">{scans.length}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Threats Found</div>
            <div className="summary-value red">{threats}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Safe Emails</div>
            <div className="summary-value green">{scans.length - threats}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Cache Hits</div>
            <div className="summary-value amber">{cached}</div>
          </div>
        </div>

        {/* ── FILTER + SEARCH ── */}
        <div className="controls-row">
          <button className={`filter-btn ${filter === "all"      ? "active"       : ""}`} onClick={() => setFilter("all")}>ALL</button>
          <button className={`filter-btn red   ${filter === "phishing" ? "active" : ""}`} onClick={() => setFilter("phishing")}>PHISHING</button>
          <button className={`filter-btn green ${filter === "safe"     ? "active" : ""}`} onClick={() => setFilter("safe")}>SAFE</button>
          <button className={`filter-btn amber ${filter === "cached"   ? "active" : ""}`} onClick={() => setFilter("cached")}>⚡ CACHED</button>
          <input
            className="search-input"
            placeholder="SEARCH EMAIL PREVIEW..."
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              setFiltered(scans.filter((s) => (s.email_preview || "").toLowerCase().includes(q)));
            }}
          />
          <div className="result-count">{filtered.length} RECORDS</div>
        </div>

        {/* ── TABLE ── */}
        <div className="table-panel">
          {loading ? (
            <div className="loading-row">
              <div className="mini-spinner" />
              LOADING SCAN HISTORY...
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {scans.length === 0
                ? "NO SCANS YET — RUN YOUR FIRST SCAN AT /SCAN"
                : "NO RECORDS MATCH YOUR FILTER"}
            </div>
          ) : (
            <table className="hist-table">
              <thead>
                <tr>
                  <th>DATE / TIME</th>
                  <th>EMAIL PREVIEW</th>
                  <th>VERDICT</th>
                  <th>SCORE</th>
                  <th>CACHE</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((scan) => {
                  const isPhish = scan.label === "phishing" || scan.label === "suspicious";
                  return (
                    <tr key={scan.id}>
                      <td className="td-date">{formatDate(scan.timestamp)}</td>
                      <td className="td-preview">{scan.email_preview || "—"}</td>
                      <td>
                        <span className={`verdict-badge ${isPhish ? "phish" : "safe"}`}>
                          {isPhish ? "PHISHING" : "SAFE"}
                        </span>
                      </td>
                      <td>
                        <span className="td-score" style={{ color: isPhish ? "#ff4d6d" : "#2dc56a" }}>
                          {Math.round(scan.score ?? 0)}%
                        </span>
                      </td>
                      <td>
                        {scan.cache_hit
                          ? <span className="cached-badge">⚡ HIT</span>
                          : <span className="td-dash">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;