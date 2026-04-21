// src/components/DataPanel.jsx
import React, { useState } from "react";

function syntaxHighlight(value) {
  if (typeof value === "string") return <span style={{ color: "#ffee00" }}>"{value}"</span>;
  if (typeof value === "number") return <span style={{ color: "#00e5ff" }}>{value}</span>;
  if (typeof value === "boolean") return <span style={{ color: "#ff00aa" }}>{String(value)}</span>;
  if (value === null) return <span style={{ color: "#ff2244" }}>null</span>;
  if (typeof value === "object") return <span style={{ color: "rgba(0,255,136,0.7)" }}>[object]</span>;
  return <span>{String(value)}</span>;
}

function DocLine({ k, v, indent = 1 }) {
  const pad = "  ".repeat(indent);
  if (typeof v === "object" && v !== null && !Array.isArray(v)) {
    return (
      <>
        <div>
          {pad}
          <span style={{ color: "rgba(0,255,136,0.6)" }}>{k}</span>
          <span style={{ color: "rgba(0,255,136,0.4)" }}>: {"{"}</span>
        </div>
        {Object.entries(v).map(([k2, v2]) => (
          <DocLine key={k2} k={k2} v={v2} indent={indent + 1} />
        ))}
        <div>{pad}<span style={{ color: "rgba(0,255,136,0.4)" }}>{"}"}</span></div>
      </>
    );
  }
  return (
    <div>
      {pad}
      <span style={{ color: "rgba(0,255,136,0.6)" }}>{k}</span>
      <span style={{ color: "rgba(0,255,136,0.4)" }}>: </span>
      {syntaxHighlight(v)}
      <span style={{ color: "rgba(0,255,136,0.3)" }}>,</span>
    </div>
  );
}

function DocCard({ doc }) {
  return (
    <div style={{
      background: "rgba(0,20,10,0.6)",
      border: "1px solid rgba(0,255,136,0.2)",
      borderRadius: "4px",
      padding: "8px 12px",
      fontSize: "12px",
      fontFamily: "var(--font-mono)",
      lineHeight: "1.6",
      marginBottom: "8px",
    }}>
      <span style={{ color: "rgba(0,255,136,0.4)" }}>{"{"}</span>
      {Object.entries(doc).map(([k, v]) => (
        <DocLine key={k} k={k} v={v} indent={1} />
      ))}
      <span style={{ color: "rgba(0,255,136,0.4)" }}>{"}"}</span>
    </div>
  );
}

export function DataPanel({ node }) {
  const [showExtra, setShowExtra] = useState(false);

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      borderRight: "1px solid rgba(0,255,136,0.2)",
    }}>
      {/* Collection header */}
      <div style={{
        marginBottom: "12px",
        fontFamily: "var(--font-display)",
        fontSize: "11px",
        letterSpacing: "0.2em",
        color: "var(--neon-cyan)",
      }}>
        db.<span style={{ color: "var(--neon-green)" }}>{node.collection}</span>
        <span style={{ color: "rgba(0,255,136,0.4)" }}> — {node.data.length} docs</span>
      </div>

      {node.data.map((doc) => <DocCard key={doc._id} doc={doc} />)}

      {/* Extra collection for lookup */}
      {node.extraData && (
        <>
          <button
            onClick={() => setShowExtra(!showExtra)}
            style={{
              marginTop: "8px",
              marginBottom: "10px",
              background: "none",
              border: "1px solid rgba(0,229,255,0.4)",
              color: "var(--neon-cyan)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              padding: "4px 10px",
              cursor: "pointer",
              letterSpacing: "0.1em",
              borderRadius: "3px",
            }}
          >
            {showExtra ? "▼" : "▶"} db.{node.extraCollection} ({node.extraData.length} docs)
          </button>
          {showExtra && node.extraData.map((doc) => <DocCard key={doc._id} doc={doc} />)}
        </>
      )}
    </div>
  );
}
