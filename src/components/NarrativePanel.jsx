// src/components/NarrativePanel.jsx
import React, { useState, useEffect } from "react";

const s = {
  panel: {
    padding: "16px",
    borderBottom: "1px solid rgba(0,255,136,0.2)",
    background: "rgba(0,5,2,0.5)",
  },
  codename: {
    fontFamily: "var(--font-display)",
    fontSize: "14px",
    letterSpacing: "0.3em",
    color: "var(--neon-cyan)",
    textShadow: "0 0 10px var(--neon-cyan)",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "11px",
    color: "rgba(0,255,136,0.5)",
    letterSpacing: "0.2em",
    marginBottom: "12px",
  },
  narrative: {
    fontSize: "12px",
    color: "rgba(0,255,136,0.8)",
    lineHeight: "1.7",
    marginBottom: "12px",
    whiteSpace: "pre-line",
  },
  objectiveBox: {
    border: "1px solid rgba(0,229,255,0.3)",
    borderLeft: "3px solid var(--neon-cyan)",
    padding: "8px 12px",
    fontSize: "12px",
    color: "var(--neon-cyan)",
    lineHeight: "1.5",
    marginBottom: "12px",
    background: "rgba(0,229,255,0.03)",
  },
  hintRow: { display: "flex", gap: "8px" },
  hintBtn: {
    background: "none",
    border: "1px solid rgba(255,0,170,0.4)",
    color: "var(--neon-magenta)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    padding: "4px 10px",
    cursor: "pointer",
    letterSpacing: "0.1em",
    borderRadius: "3px",
    transition: "all 0.2s",
  },
};

export function NarrativePanel({ node }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  // Typewriter effect for narrative
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const text = node.narrative;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [node.id]);

  const showHint = (n) => {
    const msg = n === 1 ? node.hint1 : node.hint2;
    window.__nexusWriteHint?.(`[PISTA ${n}] ${msg}`);
  };

  return (
    <div style={s.panel}>
      <div style={s.codename}>
        NODE {node.id}/{5} — {node.codename}
      </div>
      <div style={s.subtitle}>{node.subtitle}</div>

      <div style={s.narrative}>
        {displayed}
        {!done && <span style={{ color: "var(--neon-green)" }}>█</span>}
      </div>

      <div style={s.objectiveBox}>
        <span style={{ color: "rgba(0,229,255,0.6)", fontSize: "10px", letterSpacing: "0.2em" }}>
          OBJETIVO ▸{" "}
        </span>
        {node.objective}
      </div>

      <div style={s.hintRow}>
        <button style={s.hintBtn} onClick={() => showHint(1)}>
          [PISTA 1]
        </button>
        <button style={s.hintBtn} onClick={() => showHint(2)}>
          [PISTA 2 — SPOILER]
        </button>
      </div>
    </div>
  );
}
