// src/components/Ranking.jsx
// Displays the top N runs. Fetched on mount; `highlightId` marks the just-submitted run.

import React, { useEffect, useState } from "react";
import { fetchTop } from "../ranking/rankingClient";

function formatDuration(ms) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}:${String(rs).padStart(2, "0")}`;
}

export function Ranking({ limit = 10, accent = "var(--neon-cyan)", highlightId = null, reloadKey = 0 }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchTop(limit).then((data) => {
      if (!cancelled) setRows(data);
    });
    return () => { cancelled = true; };
  }, [limit, reloadKey]);

  if (rows === null) {
    return (
      <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
        ▸ Cargando ranking...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
        ▸ Aún no hay registros. Sé el primero.
      </div>
    );
  }

  return (
    <div style={{
      width: "min(100%, 520px)",
      border: `1px solid ${accent}`,
      padding: "12px 16px",
      background: "rgba(0,0,0,0.4)",
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr 90px 70px 60px",
        gap: "8px",
        color: accent,
        letterSpacing: "0.15em",
        fontSize: "10px",
        paddingBottom: "6px",
        borderBottom: `1px solid ${accent}`,
        marginBottom: "6px",
      }}>
        <span>#</span>
        <span>HANDLE</span>
        <span style={{ textAlign: "right" }}>SCORE</span>
        <span style={{ textAlign: "right" }}>TIEMPO</span>
        <span style={{ textAlign: "right" }}>FIN</span>
      </div>
      {rows.map((r, i) => {
        const isMe = r.id === highlightId;
        const color = isMe ? "var(--neon-green)" : "rgba(255,255,255,0.8)";
        return (
          <div key={r.id} style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 90px 70px 60px",
            gap: "8px",
            color,
            padding: "3px 0",
            textShadow: isMe ? "0 0 6px var(--neon-green)" : "none",
          }}>
            <span>{i + 1}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.name}
            </span>
            <span style={{ textAlign: "right" }}>{r.score}</span>
            <span style={{ textAlign: "right", color: "rgba(255,255,255,0.6)" }}>
              {formatDuration(r.durationMs)}
            </span>
            <span style={{
              textAlign: "right",
              color: r.outcome === "win" ? "var(--neon-green)" : "var(--neon-red)",
              fontSize: "10px",
              letterSpacing: "0.1em",
            }}>
              {r.outcome === "win" ? "WIN" : "LOSE"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
