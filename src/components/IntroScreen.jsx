// src/components/IntroScreen.jsx
import React, { useState, useEffect } from "react";
import {
  playIntroBoot,
  playIntroLine,
  playIntroReady,
  playIntroStart,
  startIntroAmbient,
} from "../sounds/audioEngine";

const INTRO_LINES = [
  "AÑO 2099. LA CORPORACIÓN NEXUS-7 CONTROLA TODOS LOS DATOS DEL MUNDO.",
  "",
  "SUS SERVIDORES SON IMPENETRABLES. SUS IAs GUARDIANAS, IMPLACABLES.",
  "",
  "ERES UN DATA-BREACHER. EL MEJOR.",
  "",
  "TIENES 3 VIDAS. CADA 3 ERRORES EN UN NODO: PIERDES UNA.",
  "",
  "HAY 5 NODOS. CADA UNO CUSTODIADO POR UNA IA.",
  "",
  "TU ARMA: MONGODB QUERY LANGUAGE.",
  "",
  "▸ INFILTRA NEXUS-7. LIBERA LOS DATOS.",
];

export function IntroScreen({ onStart }) {
  const [lines, setLines] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stopAmbient = startIntroAmbient();
    playIntroBoot();
    let i = 0;
    const iv = setInterval(() => {
      if (i < INTRO_LINES.length) {
        const line = INTRO_LINES[i];
        setLines((prev) => [...prev, line]);
        if (line) playIntroLine();
        i++;
      } else {
        clearInterval(iv);
        setTimeout(() => {
          playIntroReady();
          setReady(true);
        }, 600);
      }
    }, 300);
    return () => { clearInterval(iv); stopAmbient(); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 3000,
      background: "#050810",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px",
      fontFamily: "var(--font-mono)",
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(20px, 5vw, 42px)",
        letterSpacing: "0.4em",
        color: "var(--neon-green)",
        textShadow: "0 0 20px var(--neon-green), 0 0 40px rgba(0,255,136,0.4)",
        marginBottom: "10px",
        textAlign: "center",
      }}>
        NEXUS-7
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "11px",
        letterSpacing: "0.5em",
        color: "var(--neon-cyan)",
        marginBottom: "50px",
        textAlign: "center",
      }}>
        // MONGODB ESCAPE ROOM //
      </div>

      {/* Story lines */}
      <div style={{
        maxWidth: "600px",
        width: "100%",
        minHeight: "280px",
      }}>
        {lines.map((line, i) => (
          <p key={i} style={{
            fontSize: "13px",
            color: line.startsWith("▸") ? "var(--neon-cyan)" : "rgba(0,255,136,0.8)",
            letterSpacing: "0.1em",
            lineHeight: "1.6",
            margin: line === "" ? "6px 0" : "2px 0",
            textShadow: line.startsWith("▸") ? "0 0 8px var(--neon-cyan)" : "none",
            animation: "fade-in 0.3s ease forwards",
          }}>
            {line}
          </p>
        ))}
      </div>

      {/* Start button */}
      {ready && (
        <button
          onClick={() => { playIntroStart(); onStart(); }}
          className="pulse-border fade-in"
          style={{
            marginTop: "40px",
            background: "none",
            border: "2px solid var(--neon-green)",
            color: "var(--neon-green)",
            fontFamily: "var(--font-display)",
            fontSize: "14px",
            letterSpacing: "0.4em",
            padding: "14px 40px",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(0,255,136,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(0,255,136,0.1)";
            e.target.style.boxShadow = "0 0 40px rgba(0,255,136,0.6)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "none";
            e.target.style.boxShadow = "0 0 20px rgba(0,255,136,0.3)";
          }}
        >
          [ INICIAR INFILTRACIÓN ]
        </button>
      )}

      {/* Credit */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        right: "28px",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.35em",
        color: "rgba(0,229,255,0.45)",
        textShadow: "0 0 6px rgba(0,229,255,0.3)",
        pointerEvents: "none",
      }}>
        by kan0p
      </div>
    </div>
  );
}
