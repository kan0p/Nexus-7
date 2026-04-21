// src/components/EndScreens.jsx
import React, { useEffect, useState } from "react";
import { playGameOver, playVictory } from "../sounds/audioEngine";

const ASCII_GAMEOVER = `
 ██████╗  █████╗ ███╗   ███╗███████╗
██╔════╝ ██╔══██╗████╗ ████║██╔════╝
██║  ███╗███████║██╔████╔██║█████╗  
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
          ██████╗ ██╗   ██╗███████╗██████╗ 
         ██╔═══██╗██║   ██║██╔════╝██╔══██╗
         ██║   ██║██║   ██║█████╗  ██████╔╝
         ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
         ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║
          ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝
`;

const ASCII_WIN = `
███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗ █████╗ 
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║██╔══██╗
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║███████║
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║██╔══██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║██║  ██║
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝
`;

function GlitchText({ text, color }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <pre style={{
      color,
      fontSize: "8px",
      lineHeight: "1.1",
      textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
      fontFamily: "var(--font-mono)",
      filter: glitch ? "blur(1px) brightness(2)" : "none",
      transition: "filter 0.1s",
      overflow: "hidden",
    }}>
      {text}
    </pre>
  );
}

export function GameOverScreen({ onRestart }) {
  useEffect(() => { playGameOver(); }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "#050810",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)",
    }}>
      <GlitchText text={ASCII_GAMEOVER} color="#ff2244" />
      <p style={{
        color: "rgba(255,34,68,0.7)",
        fontSize: "12px",
        letterSpacing: "0.3em",
        margin: "30px 0",
        textAlign: "center",
        lineHeight: "1.8",
      }}>
        NEXUS-7 HA ELIMINADO TU CONEXIÓN<br />
        TODOS TUS DATOS HAN SIDO BORRADOS
      </p>
      <button onClick={onRestart} style={{
        background: "none",
        border: "2px solid #ff2244",
        color: "#ff2244",
        fontFamily: "var(--font-display)",
        fontSize: "13px",
        letterSpacing: "0.3em",
        padding: "12px 30px",
        cursor: "pointer",
        boxShadow: "0 0 20px rgba(255,34,68,0.5)",
        transition: "all 0.2s",
      }}>
        [ REINTENTAR INFILTRACIÓN ]
      </button>
    </div>
  );
}

export function VictoryScreen({ onRestart }) {
  useEffect(() => { playVictory(); }, []);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "#050810",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)",
    }}>
      <GlitchText text={ASCII_WIN} color="#00ff88" />
      {show && (
        <div className="fade-in" style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{
            color: "rgba(0,255,136,0.8)",
            fontSize: "12px",
            letterSpacing: "0.2em",
            lineHeight: "1.8",
            marginBottom: "30px",
          }}>
            NEXUS-7 HA SIDO COMPROMETIDO<br />
            LOS DATOS HAN SIDO LIBERADOS<br />
            <span style={{ color: "var(--neon-cyan)" }}>MISIÓN COMPLETADA — DATA-BREACHER</span>
          </p>
          <button onClick={onRestart} style={{
            background: "none",
            border: "2px solid var(--neon-green)",
            color: "var(--neon-green)",
            fontFamily: "var(--font-display)",
            fontSize: "13px",
            letterSpacing: "0.3em",
            padding: "12px 30px",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(0,255,136,0.4)",
          }}>
            [ NUEVA INFILTRACIÓN ]
          </button>
        </div>
      )}
    </div>
  );
}
