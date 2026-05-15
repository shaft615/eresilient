"use client";

import { useState, useRef } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";

// ── Data ────────────────────────────────────────────────────────────────────────
const DOMAINS = [
  {
    id: "D1", name: "Governance & Leadership", short: "Governance",
    isoRef: "ISO 22301 §4 / §5", icon: "⚖️",
    color: "#1a3a5c",
    questions: [
      { id: "1.1", text: "Has top management formally endorsed a Business Continuity Policy aligned with the organization's strategic objectives?", guidance: "Look for a signed, dated policy reviewed within the past 12 months." },
      { id: "1.2", text: "Is there a designated Business Continuity Manager or team with clearly defined roles, responsibilities, and authority?", guidance: "Org chart, job descriptions, or RACI should document accountability." },
      { id: "1.3", text: "Has the organization defined the scope and boundaries of its Business Continuity Management System (BCMS)?", guidance: "Scope document should identify products, services, locations, and exclusions." },
      { id: "1.4", text: "Are BCMS objectives formally established, measured, and reported to senior leadership?", guidance: "KPIs or performance metrics should be tracked and reviewed at least annually." },
      { id: "1.5", text: "Does the organization conduct a periodic management review of the BCMS (at least annually)?", guidance: "Meeting minutes or review records with tracked actions." },
      { id: "1.6", text: "Are adequate resources (budget, personnel, tools) allocated to sustain and mature the BCMS?", guidance: "Budget line items and staffing levels consistent with program scope." },
    ]
  },
  {
    id: "D2", name: "Risk Assessment & Threat Analysis", short: "Risk Assessment",
    isoRef: "ISO 22301 §8.2.3 / ISO 31000", icon: "🎯",
    color: "#1e4976",
    questions: [
      { id: "2.1", text: "Has the organization conducted a formal risk assessment identifying threats that could disrupt critical operations?", guidance: "Risk register with probability, impact, and risk scores documented." },
      { id: "2.2", text: "Are risks categorized by threat type (natural, technological, human, supply chain, cyber)?", guidance: "Risk taxonomy or heat map organized by category." },
      { id: "2.3", text: "Is the risk assessment reviewed and updated at least annually, or following a significant change?", guidance: "Evidence of review dates and change triggers." },
      { id: "2.4", text: "Are risk treatment options (mitigate, transfer, accept, avoid) defined for high-rated risks?", guidance: "Risk treatment plan with owners and target dates." },
      { id: "2.5", text: "Does the organization assess single points of failure (SPOF) across people, process, technology, and facilities?", guidance: "SPOF analysis documented within the risk assessment or BIA." },
    ]
  },
  {
    id: "D3", name: "Business Impact Analysis", short: "BIA",
    isoRef: "ISO/TS 22317 / ISO 22301 §8.2.2", icon: "📊",
    color: "#1a5c7a",
    questions: [
      { id: "3.1", text: "Has a formal BIA been conducted to identify and prioritize time-critical products, services, and supporting activities?", guidance: "BIA report with prioritized activities and impact thresholds." },
      { id: "3.2", text: "Are Maximum Tolerable Period of Disruption (MTPD), Recovery Time Objective (RTO), and Recovery Point Objective (RPO) defined for critical processes?", guidance: "RTO/RPO/MTPD documented per critical process or system." },
      { id: "3.3", text: "Has the BIA captured resource dependencies including people, technology, facilities, data, and suppliers?", guidance: "Resource dependency mapping within BIA outputs." },
      { id: "3.4", text: "Are financial and operational impact thresholds defined (e.g., tolerable vs. intolerable impact levels)?", guidance: "Impact scales with quantified thresholds (revenue, regulatory, reputational)." },
      { id: "3.5", text: "Is the BIA reviewed and updated annually or following significant organizational change?", guidance: "BIA version history or annual review cycle evidence." },
      { id: "3.6", text: "Are BIA results communicated to and validated by business process owners and senior leadership?", guidance: "Sign-off records or approval documentation from process owners." },
    ]
  },
  {
    id: "D4", name: "BC Strategy & Solutions", short: "BC Strategy",
    isoRef: "ISO/TS 22331 / ISO 22301 §8.3", icon: "🗺️",
    color: "#0f5e5e",
    questions: [
      { id: "4.1", text: "Has the organization developed continuity strategies for all critical activities identified in the BIA?", guidance: "Strategy options documented and aligned to BIA requirements." },
      { id: "4.2", text: "Are alternate work arrangements (remote work, alternate site, split operations) defined and resourced?", guidance: "Documented alternate site agreements, remote work policies." },
      { id: "4.3", text: "Are IT recovery strategies (backup, failover, cloud redundancy) aligned with defined RTOs and RPOs?", guidance: "IT DR strategy with recovery capability validated against RTO/RPO targets." },
      { id: "4.4", text: "Are supply chain continuity strategies in place for critical suppliers and dependencies (ref. ISO/TS 22318)?", guidance: "Alternate supplier lists, contractual continuity requirements." },
      { id: "4.5", text: "Are resource recovery strategies validated for feasibility (cost, lead time, capacity)?", guidance: "Feasibility assessments or simulation evidence for recovery options." },
    ]
  },
  {
    id: "D5", name: "Plans, Procedures & Documentation", short: "Plans & Docs",
    isoRef: "ISO 22301 §8.4 / ISO/TS 22332", icon: "📋",
    color: "#1a4a2e",
    questions: [
      { id: "5.1", text: "Does the organization have documented Business Continuity Plans (BCPs) for all critical business units or functions?", guidance: "BCP library indexed by department or function." },
      { id: "5.2", text: "Does each BCP include clear activation criteria, escalation procedures, and roles/responsibilities?", guidance: "Flowcharts or decision trees with named roles and escalation paths." },
      { id: "5.3", text: "Is an Incident Management / Crisis Management Plan in place to govern the initial response phase?", guidance: "IMP/CMP with EOC structure, command hierarchy, and decision authorities." },
      { id: "5.4", text: "Are IT Disaster Recovery Plans (DRPs) documented for critical systems and infrastructure?", guidance: "DR runbooks with step-by-step recovery procedures and responsible teams." },
      { id: "5.5", text: "Are plans reviewed and updated at least annually, or following an incident, exercise, or organizational change?", guidance: "Version control and review dates in plan headers or document management system." },
      { id: "5.6", text: "Are plans accessible to the right people during a disruption (offline access, secure storage, cloud)?", guidance: "Plan distribution list and offline/secure repository confirmed." },
    ]
  },
  {
    id: "D6", name: "Training, Awareness & Competence", short: "Training",
    isoRef: "ISO 22301 §7.2 / §7.3", icon: "🎓",
    color: "#4a2e6b",
    questions: [
      { id: "6.1", text: "Are employees in continuity-critical roles formally trained on their BCP responsibilities?", guidance: "Training records linked to specific BCP roles." },
      { id: "6.2", text: "Is there an organization-wide awareness program ensuring general staff understand BC procedures?", guidance: "All-staff training completion rates and awareness campaign records." },
      { id: "6.3", text: "Are crisis management team members trained in incident command, communication, and decision-making under pressure?", guidance: "CMT-specific training curriculum and completion records." },
      { id: "6.4", text: "Is competency assessed and documented for key BCMS roles?", guidance: "Competency assessments or certification records (e.g., CBCP, MBCI)." },
    ]
  },
  {
    id: "D7", name: "Exercising & Testing", short: "Exercising",
    isoRef: "ISO 22301 §8.5 / ISO/TS 22332", icon: "🧪",
    color: "#6b3a1a",
    questions: [
      { id: "7.1", text: "Does the organization conduct exercises on a defined annual schedule covering all critical BCPs?", guidance: "Exercise calendar with types (tabletop, functional, full-scale) and coverage." },
      { id: "7.2", text: "Are exercises designed against realistic scenarios aligned with the risk assessment?", guidance: "Scenario design documentation with objectives and success criteria." },
      { id: "7.3", text: "Are exercise results formally documented with corrective actions tracked to closure?", guidance: "After-Action Reports (AARs) with open item registers." },
      { id: "7.4", text: "Are IT/DR recovery tests conducted to validate RTOs and RPOs against technical capabilities?", guidance: "DR test reports with pass/fail results against target objectives." },
      { id: "7.5", text: "Are lessons learned from exercises integrated back into plans, procedures, and training?", guidance: "Evidence that AAR findings drove plan updates or training revisions." },
    ]
  },
  {
    id: "D8", name: "Performance Evaluation & Improvement", short: "Improvement",
    isoRef: "ISO 22301 §9 / §10", icon: "📈",
    color: "#5c1a1a",
    questions: [
      { id: "8.1", text: "Are BCMS performance metrics defined and measured (e.g., plan coverage, exercise completion, training rates)?", guidance: "Dashboard or report with trend data across at least one review cycle." },
      { id: "8.2", text: "Does the organization conduct formal internal audits or self-assessments of the BCMS?", guidance: "Audit schedule and findings reports with corrective action tracking." },
      { id: "8.3", text: "Are post-incident reviews conducted after actual disruptions to capture lessons learned?", guidance: "PIR process and completed reports for prior incidents." },
      { id: "8.4", text: "Are nonconformities identified and managed through a corrective action process?", guidance: "CAPA log or issue management process linked to BCMS." },
      { id: "8.5", text: "Is there a defined roadmap or improvement plan for BCMS maturity advancement?", guidance: "Multi-year program roadmap with milestones and resource allocation." },
    ]
  }
];

const SCORE_LABELS = [
  { value: 0, label: "Not Present", desc: "No evidence; not initiated", color: "#dc2626" },
  { value: 1, label: "Ad Hoc", desc: "Informal, undocumented, person-dependent", color: "#ea580c" },
  { value: 2, label: "Developing", desc: "Partially documented, inconsistently applied", color: "#d97706" },
  { value: 3, label: "Defined", desc: "Documented and consistently applied", color: "#65a30d" },
  { value: 4, label: "Optimized", desc: "Tested, measured, and continuously improved", color: "#16a34a" },
];

const MATURITY_BANDS = [
  { min: 0, max: 24, pct: [0, 14], label: "Critical", tagline: "Immediate action required", color: "#fee2e2", accent: "#dc2626", textDark: "#991b1b", description: "Foundational BCMS elements are absent or severely underdeveloped. The organization is highly exposed to operational disruption with minimal recovery capability." },
  { min: 25, max: 49, pct: [15, 29], label: "Developing", tagline: "Significant gaps identified", color: "#ffedd5", accent: "#ea580c", textDark: "#9a3412", description: "Some elements exist but are inconsistent and largely undocumented. Governance, BIA, and plan documentation should be immediately prioritized." },
  { min: 50, max: 83, pct: [30, 49], label: "Established", tagline: "Core capabilities in place", color: "#fefce8", accent: "#ca8a04", textDark: "#854d0e", description: "A functional BCMS foundation exists but exercising, testing, and continuous improvement programs need investment to close remaining gaps." },
  { min: 84, max: 117, pct: [50, 69], label: "Advanced", tagline: "Tested and functional program", color: "#f0fdf4", accent: "#16a34a", textDark: "#166534", description: "The program is well-documented, exercised, and managed. Focus should shift to supply chain integration, metrics maturity, and embedding BC culture." },
  { min: 118, max: 168, pct: [70, 100], label: "Optimized", tagline: "Best-in-class resilience", color: "#ecfdf5", accent: "#059669", textDark: "#064e3b", description: "Best-in-class maturity. Sustain through innovation, external benchmarking, ISO 22301 certification readiness, and cultural embedding across the enterprise." },
];

const TOTAL_MAX = DOMAINS.reduce((s, d) => s + d.questions.length * 4, 0);

function getMaturity(totalScore) {
  return MATURITY_BANDS.find(b => totalScore >= b.min && totalScore <= b.max) || MATURITY_BANDS[0];
}

function getDomainScore(scores, domainId) {
  const domain = DOMAINS.find(d => d.id === domainId);
  return domain.questions.reduce((sum, q) => sum + (scores[q.id] ?? 0), 0);
}

function getDomainPct(scores, domainId) {
  const domain = DOMAINS.find(d => d.id === domainId);
  const max = domain.questions.length * 4;
  return Math.round((getDomainScore(scores, domainId) / max) * 100);
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function ScoreButton({ value, selected, onClick }) {
  const s = SCORE_LABELS[value];
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        flex: 1,
        padding: "10px 6px",
        borderRadius: "8px",
        border: selected ? `2px solid ${s.color}` : "2px solid #e2e8f0",
        background: selected ? s.color + "18" : "#f8fafc",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        position: "relative",
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: selected ? s.color : "#cbd5e1",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 15,
        fontFamily: "var(--font-aptos), monospace",
        boxShadow: selected ? `0 0 0 3px ${s.color}33` : "none",
        transition: "all 0.15s",
      }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: selected ? s.color : "#64748b", textAlign: "center", lineHeight: 1.2 }}>{s.label}</div>
      <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", lineHeight: 1.2, display: "none" }}>{s.desc}</div>
    </button>
  );
}

function ProgressBar({ value, max, color = "#1a3a5c" }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
    </div>
  );
}

function DomainPill({ domain, active, completed, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 10px",
        borderRadius: 20,
        border: "none",
        background: active ? domain.color : completed ? "#e0f2fe" : "#f1f5f9",
        color: active ? "#fff" : completed ? "#0369a1" : "#64748b",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "var(--font-aptos), sans-serif",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >{domain.short}</button>
  );
}

// ── Score Ring ──────────────────────────────────────────────────────────────────
function ScoreRing({ pct, size = 120, stroke = 10, color = "#1a3a5c" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────────
export default function BCPAssessment() {
  const [phase, setPhase] = useState("intro"); // intro | assessment | results
  const [currentDomain, setCurrentDomain] = useState(0);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [orgName, setOrgName] = useState("");
  const [assessorName, setAssessorName] = useState("");
  const [assessDate, setAssessDate] = useState(new Date().toISOString().split("T")[0]);
  const [animIn, setAnimIn] = useState(true);
  // Attached to the domain card so we can scroll the user back up to
  // the top of the new domain when they navigate. The previous version
  // declared a ref but never wired it to a DOM node, so the scroll
  // never fired and users landed mid-page on the next domain.
  const domainCardRef = useRef(null);

  // Smooth-scroll the window so the top of the domain card is at the
  // top of the viewport (with a small offset for breathing room).
  function scrollToDomainTop() {
    if (typeof window === "undefined") return;
    const node = domainCardRef.current;
    if (node) {
      const top = node.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const domain = DOMAINS[currentDomain];
  const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const maturity = getMaturity(totalScore);
  const overallPct = Math.round((totalScore / TOTAL_MAX) * 100);

  const domainAnswered = (d) => d.questions.every(q => scores[q.id] !== undefined);
  const allAnswered = DOMAINS.every(domainAnswered);
  const domainScore = getDomainScore(scores, domain.id);
  const domainMax = domain.questions.length * 4;

  function setScore(qId, val) {
    setScores(prev => ({ ...prev, [qId]: val }));
  }

  function navigate(dir) {
    setAnimIn(false);
    setTimeout(() => {
      setCurrentDomain(prev => Math.max(0, Math.min(DOMAINS.length - 1, prev + dir)));
      setAnimIn(true);
      // Wait one paint so the new domain content is in the DOM, then
      // scroll to the top of the (newly-laid-out) card.
      setTimeout(scrollToDomainTop, 0);
    }, 150);
  }

  function goToResults() {
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const radarData = DOMAINS.map(d => ({
    domain: d.short,
    score: getDomainPct(scores, d.id),
    fullMark: 100,
  }));

  const barData = DOMAINS.map(d => ({
    name: d.id,
    label: d.short,
    score: getDomainScore(scores, d.id),
    max: d.questions.length * 4,
    pct: getDomainPct(scores, d.id),
    color: d.color,
  }));

  const weakDomains = [...barData].sort((a, b) => a.pct - b.pct).slice(0, 3);

  // Fonts inherited from root layout (Aptos / Aptos Display via next/font/local)
  const styles = {
    wrap: {
      fontFamily: "var(--font-aptos), sans-serif",
      background: "linear-gradient(135deg, #2D000F 0%, #4a0a1d 50%, #2D000F 100%)",
      minHeight: "100vh",
      color: "#0f172a",
    },
    card: {
      background: "#fff",
      borderRadius: 16,
      padding: "32px 36px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    },
    headerBand: {
      background: "linear-gradient(135deg, #2D000F 0%, #9D3057 100%)",
      padding: "16px 28px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // INTRO SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (phase === "intro") {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px 60px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", background: "rgba(251,92,1,0.15)", border: "1px solid rgba(251,92,1,0.4)", borderRadius: 20, padding: "6px 18px", marginBottom: 20 }}>
              <span style={{ color: "#FB5C01", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>ISO 22301-Aligned</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 12px" }}>
              BCP Readiness Assessment
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 520, margin: "0 auto 8px" }}>
              Evaluate your organization&apos;s business continuity maturity across 8 critical domains and receive an instant scorecard.
            </p>
            <p style={{ color: "#64748b", fontSize: 13 }}>42 questions · ~20 minutes · Instant results</p>
          </div>

          {/* Domain chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 40 }}>
            {DOMAINS.map(d => (
              <div key={d.id} style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20, padding: "6px 14px",
                color: "#cbd5e1", fontSize: 12, fontWeight: 600,
              }}>{d.icon} {d.short}</div>
            ))}
          </div>

          {/* Form */}
          <div style={{ ...styles.card, marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: 20, fontWeight: 700, color: "#1a3a5c", marginTop: 0, marginBottom: 20 }}>Assessment Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Organization Name *</label>
                <input
                  value={orgName} onChange={e => setOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-aptos), sans-serif", boxSizing: "border-box", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Assessor Name</label>
                <input
                  value={assessorName} onChange={e => setAssessorName(e.target.value)}
                  placeholder="Enter assessor name"
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-aptos), sans-serif", boxSizing: "border-box", outline: "none" }}
                />
              </div>
            </div>
            <div style={{ maxWidth: 220 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Assessment Date</label>
              <input
                type="date" value={assessDate} onChange={e => setAssessDate(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-aptos), sans-serif", boxSizing: "border-box", outline: "none" }}
              />
            </div>
          </div>

          {/* Scoring guide */}
          <div style={{ ...styles.card, marginBottom: 28 }}>
            <h2 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: 18, fontWeight: 700, color: "#1a3a5c", marginTop: 0, marginBottom: 16 }}>Scoring Scale</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SCORE_LABELS.map(s => (
                <div key={s.value} style={{ flex: 1, minWidth: 120, background: s.color + "12", border: `1.5px solid ${s.color}33`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: s.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-aptos), monospace" }}>{s.value}</div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => { if (!orgName.trim()) { alert("Please enter the organization name to proceed."); return; } setPhase("assessment"); }}
              style={{
                background: "linear-gradient(135deg, #FB5C01, #ff7a2e)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "16px 48px", fontSize: 16, fontWeight: 700,
                fontFamily: "var(--font-aptos), sans-serif", cursor: "pointer",
                boxShadow: "0 8px 24px rgba(26,58,92,0.4)",
                letterSpacing: 0.3,
              }}
            >Begin Assessment →</button>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 12 }}>Confidential · For consulting and internal use only</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (phase === "results") {
    return (
      <div style={styles.wrap}>
        {/*
          Print stylesheet — addresses the Recharts charts not appearing
          on the printed/PDF output.

          Two issues this fixes:
            1. Recharts' ResponsiveContainer measures the parent via JS
               at runtime. During the browser's print rendering pass the
               measurement is often 0 (or wrong), so the SVG renders
               with no visible content. We force fixed pixel dimensions
               on the recharts container/wrapper/SVG in print so the
               chart has real geometry to draw into.
            2. The on-screen 2-column chart grid is too wide for a
               printed page. Collapse to a single column in print.

          Also: print-color-adjust:exact preserves the SVG fills (radar
          area, bar colors) instead of letting the browser strip them.
        */}
        <style>{`
          @media print {
            html, body {
              background: #fff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .scorecard-charts-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            .scorecard-chart-card {
              page-break-inside: avoid;
              break-inside: avoid;
              width: 100% !important;
            }
            .scorecard-chart-card .recharts-responsive-container {
              width: 640px !important;
              height: 320px !important;
            }
            .scorecard-chart-card .recharts-wrapper,
            .scorecard-chart-card .recharts-surface,
            .scorecard-chart-card svg {
              width: 640px !important;
              height: 320px !important;
            }
            /* Keep Recharts SVG fills/strokes in the printed output. */
            .scorecard-chart-card svg * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 60px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-block", background: "rgba(251,92,1,0.15)", border: "1px solid rgba(251,92,1,0.4)", borderRadius: 20, padding: "6px 18px", marginBottom: 16 }}>
              <span style={{ color: "#FB5C01", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Assessment Complete</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>BCP Readiness Scorecard</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>{orgName}{assessorName ? ` · ${assessorName}` : ""} · {assessDate}</p>
          </div>

          {/* Overall Score Card */}
          <div style={{ ...styles.card, marginBottom: 20, background: maturity.color, border: `2px solid ${maturity.accent}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ScoreRing pct={overallPct} size={130} stroke={11} color={maturity.accent} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-aptos), monospace", fontSize: 26, fontWeight: 700, color: maturity.textDark, lineHeight: 1 }}>{overallPct}%</div>
                  <div style={{ fontSize: 10, color: maturity.accent, fontWeight: 700 }}>{totalScore}/{TOTAL_MAX}</div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ background: maturity.accent, color: "#fff", borderRadius: 8, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>{maturity.label}</span>
                  <span style={{ color: maturity.textDark, fontSize: 14, fontWeight: 600 }}>{maturity.tagline}</span>
                </div>
                <p style={{ color: maturity.textDark, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>{maturity.description}</p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 12, color: maturity.textDark }}><b>Total Score:</b> {totalScore} / {TOTAL_MAX}</div>
                  <div style={{ fontSize: 12, color: maturity.textDark }}><b>Questions:</b> 42</div>
                  <div style={{ fontSize: 12, color: maturity.textDark }}><b>Domains:</b> 8</div>
                </div>
              </div>
            </div>
          </div>

          {/* Maturity Band Legend */}
          <div style={{ ...styles.card, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: 18, fontWeight: 700, color: "#1a3a5c", marginTop: 0, marginBottom: 14 }}>Maturity Bands</h2>
            <div style={{ display: "flex", gap: 4, borderRadius: 8, overflow: "hidden", height: 32 }}>
              {MATURITY_BANDS.map(b => (
                <div key={b.label} style={{
                  flex: b.max - b.min,
                  background: b.label === maturity.label ? b.accent : b.accent + "55",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#fff",
                  transition: "all 0.3s",
                  border: b.label === maturity.label ? `2px solid ${b.accent}` : "none",
                }}>{b.label}</div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {MATURITY_BANDS.map(b => (
                <div key={b.label} style={{ fontSize: 10, color: "#94a3b8", flex: 1, textAlign: "center" }}>{b.min}–{b.max}</div>
              ))}
            </div>
          </div>

          {/* Charts row */}
          <div className="scorecard-charts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Radar */}
            <div className="scorecard-chart-card" style={{ ...styles.card }}>
              <h2 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: 16, fontWeight: 700, color: "#1a3a5c", marginTop: 0, marginBottom: 8 }}>Capability Radar</h2>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "#475569", fontFamily: "var(--font-aptos), sans-serif" }} />
                  <Radar name="Score" dataKey="score" stroke="#1a3a5c" fill="#1a3a5c" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Bar */}
            <div className="scorecard-chart-card" style={{ ...styles.card }}>
              <h2 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: 16, fontWeight: 700, color: "#1a3a5c", marginTop: 0, marginBottom: 8 }}>Domain Scores (%)</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: "var(--font-aptos), sans-serif" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: "var(--font-aptos), monospace", fill: "#1a3a5c" }} width={28} />
                  <Tooltip formatter={(v, n, p) => [`${v}% (${p.payload.score}/${p.payload.max})`, p.payload.label]} contentStyle={{ fontFamily: "var(--font-aptos), sans-serif", fontSize: 12 }} />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Domain Detail Cards */}
          <div style={{ ...styles.card, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: 18, fontWeight: 700, color: "#1a3a5c", marginTop: 0, marginBottom: 16 }}>Domain Scorecard</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {DOMAINS.map(d => {
                const ds = getDomainScore(scores, d.id);
                const dm = d.questions.length * 4;
                const dp = getDomainPct(scores, d.id);
                const bandColor = dp >= 70 ? "#16a34a" : dp >= 50 ? "#ca8a04" : dp >= 30 ? "#ea580c" : "#dc2626";
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: 36, textAlign: "center", fontFamily: "var(--font-aptos), monospace", fontSize: 11, fontWeight: 700, color: "#fff", background: d.color, borderRadius: 6, padding: "3px 0" }}>{d.id}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 5 }}>{d.name}</div>
                      <ProgressBar value={dp} max={100} color={bandColor} />
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-aptos), monospace", fontSize: 16, fontWeight: 700, color: bandColor }}>{dp}%</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{ds}/{dm} pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Priority Areas */}
          <div style={{ ...styles.card, marginBottom: 20, background: "#fff7ed", border: "1.5px solid #fed7aa" }}>
            <h2 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: 18, fontWeight: 700, color: "#9a3412", marginTop: 0, marginBottom: 14 }}>⚠️ Top Priority Areas</h2>
            <p style={{ color: "#7c2d12", fontSize: 13, marginTop: 0, marginBottom: 16 }}>The following domains scored lowest and represent the greatest areas of need. Address these first for maximum resilience uplift.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {weakDomains.map((d, i) => (
                <div key={d.name} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: `1.5px solid #fed7aa` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#ea580c", color: "#fff", borderRadius: 4, padding: "2px 8px" }}>#{i + 1} Priority</span>
                    <span style={{ fontFamily: "var(--font-aptos), monospace", fontSize: 15, fontWeight: 700, color: "#dc2626" }}>{d.pct}%</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 4 }}>{d.label}</div>
                  <ProgressBar value={d.pct} max={100} color="#ea580c" />
                </div>
              ))}
            </div>
          </div>

          {/* Question-level detail */}
          <div style={{ ...styles.card, marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-aptos-display), serif", fontSize: 18, fontWeight: 700, color: "#1a3a5c", marginTop: 0, marginBottom: 16 }}>Question-Level Detail</h2>
            {DOMAINS.map(d => (
              <div key={d.id} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 12px", background: d.color, borderRadius: 8 }}>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{d.icon} {d.id} — {d.name}</span>
                  <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "var(--font-aptos), monospace" }}>{getDomainScore(scores, d.id)}/{d.questions.length * 4}</span>
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  {d.questions.map(q => {
                    const s = scores[q.id] ?? 0;
                    const sl = SCORE_LABELS[s];
                    const note = notes[q.id];
                    return (
                      <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: sl.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-aptos), monospace", flexShrink: 0, marginTop: 1 }}>{s}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.5, marginBottom: note ? 4 : 0 }}><b style={{ color: "#64748b" }}>{q.id}</b> {q.text}</div>
                          {note && <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>Note: {note}</div>}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: sl.color, flexShrink: 0, minWidth: 64, textAlign: "right" }}>{sl.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => window.print()} style={{ background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-aptos), sans-serif", cursor: "pointer" }}>
              🖨️ Print / Save PDF
            </button>
            <button onClick={() => { setPhase("intro"); setScores({}); setNotes({}); setCurrentDomain(0); setOrgName(""); }} style={{ background: "transparent", color: "#94a3b8", border: "1.5px solid #334155", borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-aptos), sans-serif", cursor: "pointer" }}>
              ↩ Start New Assessment
            </button>
            <button onClick={() => { setPhase("assessment"); setCurrentDomain(0); }} style={{ background: "transparent", color: "#FB5C01", border: "1.5px solid #FB5C01", borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-aptos), sans-serif", cursor: "pointer" }}>
              ✏️ Edit Responses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ASSESSMENT SCREEN
  // ═══════════════════════════════════════════════════════════════
  const totalAnswered = Object.keys(scores).length;
  const totalQs = DOMAINS.reduce((s, d) => s + d.questions.length, 0);

  return (
    <div style={styles.wrap}>
      {/* Top nav bar */}
      <div style={styles.headerBand}>
        <div>
          <div style={{ color: "#FB5C01", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>BCP Readiness Assessment</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{orgName}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>{totalAnswered}/{totalQs} answered</div>
          {allAnswered && (
            <button onClick={goToResults} style={{ background: "#FB5C01", color: "#2D000F", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-aptos), sans-serif", cursor: "pointer" }}>
              View Scorecard →
            </button>
          )}
        </div>
      </div>

      {/* Overall progress */}
      <div style={{ background: "#3a0613", padding: "8px 28px" }}>
        <ProgressBar value={totalAnswered} max={totalQs} color="#FB5C01" />
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 16px 60px" }}>
        {/* Domain nav pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {DOMAINS.map((d, i) => (
            <DomainPill key={d.id} domain={d} active={i === currentDomain} completed={domainAnswered(d)} onClick={() => { setAnimIn(false); setTimeout(() => { setCurrentDomain(i); setAnimIn(true); setTimeout(scrollToDomainTop, 0); }, 150); }} />
          ))}
        </div>

        {/* Domain card */}
        <div ref={domainCardRef} style={{
          ...styles.card,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.15s, transform 0.15s",
        }}>
          {/* Domain header */}
          <div style={{ background: domain.color, borderRadius: 10, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{domain.isoRef}</div>
              <div style={{ color: "#fff", fontFamily: "var(--font-aptos-display), serif", fontSize: 20, fontWeight: 700 }}>{domain.icon} {domain.id} — {domain.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-aptos), monospace", color: "#fff", fontSize: 22, fontWeight: 700 }}>{domainScore}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>/{domainMax}</span></div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{Math.round((domainScore / domainMax) * 100)}%</div>
            </div>
          </div>

          {/* Domain progress */}
          <div style={{ marginBottom: 24 }}>
            <ProgressBar value={domainScore} max={domainMax} color={domain.color} />
          </div>

          {/* Questions */}
          <div style={{ display: "grid", gap: 20 }}>
            {domain.questions.map((q) => {
              const answered = scores[q.id] !== undefined;
              return (
                <div key={q.id} style={{ padding: "18px 20px", borderRadius: 12, border: answered ? `1.5px solid ${domain.color}44` : "1.5px solid #e2e8f0", background: answered ? domain.color + "06" : "#fafafa", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: answered ? domain.color : "#e2e8f0", color: answered ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-aptos), monospace", flexShrink: 0 }}>{q.id}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1e293b", lineHeight: 1.6 }}>{q.text}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>💡 {q.guidance}</p>
                    </div>
                  </div>

                  {/* Score buttons */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    {SCORE_LABELS.map(s => (
                      <ScoreButton key={s.value} value={s.value} selected={scores[q.id] === s.value} onClick={(v) => setScore(q.id, v)} />
                    ))}
                  </div>

                  {/* Notes */}
                  <textarea
                    placeholder="Evidence or notes (optional)..."
                    value={notes[q.id] || ""}
                    onChange={e => setNotes(prev => ({ ...prev, [q.id]: e.target.value }))}
                    rows={2}
                    style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontFamily: "var(--font-aptos), sans-serif", color: "#475569", background: "#fff", resize: "vertical", boxSizing: "border-box", outline: "none" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Domain navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 20, borderTop: "1.5px solid #f1f5f9" }}>
            <button
              onClick={() => navigate(-1)} disabled={currentDomain === 0}
              style={{ background: "transparent", color: currentDomain === 0 ? "#cbd5e1" : "#1a3a5c", border: `1.5px solid ${currentDomain === 0 ? "#e2e8f0" : "#1a3a5c"}`, borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-aptos), sans-serif", cursor: currentDomain === 0 ? "default" : "pointer" }}
            >← Previous</button>

            <div style={{ display: "flex", gap: 6 }}>
              {domainAnswered(domain) && (
                <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 600, alignSelf: "center" }}>✓ Domain Complete</span>
              )}
            </div>

            {currentDomain < DOMAINS.length - 1 ? (
              <button
                onClick={() => navigate(1)}
                style={{ background: domain.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-aptos), sans-serif", cursor: "pointer" }}
              >Next Domain →</button>
            ) : (
              <button
                onClick={goToResults}
                style={{ background: allAnswered ? "#16a34a" : "#94a3b8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-aptos), sans-serif", cursor: "pointer" }}
              >{allAnswered ? "View Scorecard →" : "View Results (Partial)"}</button>
            )}
          </div>
        </div>

        {/* Domain overview footer */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {DOMAINS.map((d, i) => {
            const ds = getDomainScore(scores, d.id);
            const dm = d.questions.length * 4;
            const dp = Math.round((ds / dm) * 100);
            const done = domainAnswered(d);
            return (
              <div key={d.id} onClick={() => { setAnimIn(false); setTimeout(() => { setCurrentDomain(i); setAnimIn(true); setTimeout(scrollToDomainTop, 0); }, 150); }}
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${i === currentDomain ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, fontFamily: "var(--font-aptos), monospace", marginBottom: 4 }}>{d.id}</div>
                <div style={{ fontSize: 11, color: done ? "#94a3b8" : "#475569", marginBottom: 6, lineHeight: 1.3 }}>{d.short}</div>
                {done ? (
                  <>
                    <ProgressBar value={dp} max={100} color={d.color} />
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 3, fontFamily: "var(--font-aptos), monospace" }}>{dp}%</div>
                  </>
                ) : (
                  <div style={{ fontSize: 10, color: "#475569", fontStyle: "italic" }}>Not started</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
