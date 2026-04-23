// src/components/HUD.jsx
import React, { useEffect, useState } from "react";
import { MAX_LIVES, ERRORS_PER_TRAP } from "../levels/registry";

const styles = {
  hud: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    borderBottom: "1px solid rgba(0,255,136,0.3)",
    background: "rgba(0,10,5,0.8)",
    backdropFilter: "blur(4px)",
    fontFamily: "var(--font-display)",
    fontSize: "12px",
    letterSpacing: "0.1em",
    flexShrink: 0,
  },
  section: { display: "flex", alignItems: "center", gap: "12px" },
  label: { color: "rgba(0,255,136,0.5)", fontSize: "10px", letterSpacing: "0.2em" },
  lives: { display: "flex", gap: "6px" },
  heart: { fontSize: "16px", transition: "all 0.3s" },
  heartDead: { fontSize: "16px", filter: "grayscale(1)", opacity: 0.3 },
  nodeProgress: { display: "flex", gap: "6px", alignItems: "center" },
  nodeDot: {
    width: "10px", height: "10px", borderRadius: "50%",
    border: "1px solid rgba(0,255,136,0.4)",
  },
  nodeDotActive: {
    width: "10px", height: "10px", borderRadius: "50%",
    background: "var(--neon-cyan)",
    boxShadow: "0 0 8px var(--neon-cyan)",
  },
  nodeDotDone: {
    width: "10px", height: "10px", borderRadius: "50%",
    background: "var(--neon-green)",
    boxShadow: "0 0 6px var(--neon-green)",
  },
  errorBar: { display: "flex", gap: "4px", alignItems: "center" },
  errorDot: {
    width: "8px", height: "8px", borderRadius: "2px",
    border: "1px solid rgba(255,34,68,0.4)",
  },
  errorDotFilled: {
    width: "8px", height: "8px", borderRadius: "2px",
    background: "var(--neon-red)",
    boxShadow: "0 0 6px var(--neon-red)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "11px",
    letterSpacing: "0.3em",
    color: "var(--neon-green)",
    textShadow: "0 0 10px var(--neon-green)",
  },
  score: {
    fontFamily: "var(--font-display)",
    fontSize: "13px",
    letterSpacing: "0.25em",
    color: "var(--neon-cyan)",
    textShadow: "0 0 10px var(--neon-cyan)",
    minWidth: "90px",
    textAlign: "right",
  },
};

export function HUD({ lives, currentNode, totalNodes, errors, score = 0, penaltyTick = 0 }) {
  // Whenever the parent signals a soft penalty (currently: hint used), show
  // a floating "-50 PISTA" above the score and shake the score for a moment.
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!penaltyTick) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penaltyTick]);

  return (
    <div style={styles.hud}>
      {/* Left — lives */}
      <div style={styles.section}>
        <span style={styles.label}>VIDAS</span>
        <div style={styles.lives}>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} style={i < lives ? styles.heart : styles.heartDead}>
              {i < lives ? "❤" : "✕"}
            </span>
          ))}
        </div>
        <span style={styles.label}>SCORE</span>
        <span style={{ ...styles.score, position: "relative" }}>
          <span
            key={penaltyTick}
            className={flash ? "score-shake" : ""}
            style={{ display: "inline-block" }}
          >
            {score}
          </span>
          {flash && (
            <span
              key={`p-${penaltyTick}`}
              className="penalty-float"
              style={{ top: "-8px", right: "-4px" }}
            >
              -50 PISTA
            </span>
          )}
        </span>
      </div>

      {/* Center — title */}
      <div style={styles.title}>NEXUS-7 // DATA-BREACHER</div>

      {/* Right — node progress + error counter */}
      <div style={styles.section}>
        <span style={styles.label}>ERRORES</span>
        <div style={styles.errorBar}>
          {Array.from({ length: ERRORS_PER_TRAP }).map((_, i) => (
            <div key={i} style={i < errors ? styles.errorDotFilled : styles.errorDot} />
          ))}
        </div>
        <span style={styles.label}>NODOS</span>
        <div style={styles.nodeProgress}>
          {Array.from({ length: totalNodes }).map((_, i) => {
            let s = styles.nodeDot;
            if (i < currentNode) s = styles.nodeDotDone;
            else if (i === currentNode) s = styles.nodeDotActive;
            return <div key={i} style={s} />;
          })}
        </div>
      </div>
    </div>
  );
}
