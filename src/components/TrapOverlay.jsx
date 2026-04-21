// src/components/TrapOverlay.jsx
import React, { useEffect, useState } from "react";

export function TrapOverlay({ trap, onDone }) {
  const [countdown, setCountdown] = useState(trap?.type === "selfdestruct" ? 3 : null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!trap) return;

    if (trap.type === "selfdestruct") {
      let c = 3;
      const iv = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(iv);
          setTimeout(() => {
            setVisible(false);
            onDone();
          }, 600);
        }
      }, 1000);
      return () => clearInterval(iv);
    } else {
      const duration = trap.type === "emp" ? 2200 : 1800;
      const t = setTimeout(() => {
        setVisible(false);
        onDone();
      }, duration);
      return () => clearTimeout(t);
    }
  }, [trap, onDone]);

  if (!trap || !visible) return null;

  const colors = {
    electric:    { bg: "rgba(200,230,255,0.12)", accent: "#00e5ff",  icon: "⚡" },
    virus:       { bg: "rgba(150,255,0,0.08)",   accent: "#88ff00",  icon: "☣" },
    emp:         { bg: "rgba(0,0,0,0.97)",        accent: "#ff2244",  icon: "💀" },
    firewall:    { bg: "rgba(255,50,0,0.12)",     accent: "#ff4400",  icon: "🔥" },
    selfdestruct:{ bg: "rgba(255,0,0,0.15)",      accent: "#ff2244",  icon: "💥" },
  };

  const c = colors[trap.type] || colors.electric;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: c.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-display)",
      pointerEvents: "none",
    }}>
      <div style={{
        fontSize: "64px",
        marginBottom: "20px",
        animation: "glitch 0.3s steps(1) infinite",
      }}>
        {c.icon}
      </div>

      <div style={{
        fontSize: "28px",
        letterSpacing: "0.3em",
        color: c.accent,
        textShadow: `0 0 20px ${c.accent}, 0 0 40px ${c.accent}`,
        textAlign: "center",
        padding: "0 20px",
      }}>
        {trap.message}
      </div>

      {countdown !== null && (
        <div style={{
          marginTop: "30px",
          fontSize: "80px",
          fontWeight: 900,
          color: "#ff2244",
          textShadow: "0 0 30px #ff2244, 0 0 60px #ff2244",
          animation: "countdown-pulse 0.5s ease-in-out infinite",
        }}>
          {countdown > 0 ? countdown : "💥"}
        </div>
      )}

      {/* Scanline intensifier */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(0deg, transparent, transparent 1px, ${c.accent}08 1px, ${c.accent}08 3px)`,
        pointerEvents: "none",
      }} />
    </div>
  );
}
