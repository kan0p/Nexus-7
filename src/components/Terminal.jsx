// src/components/Terminal.jsx
import React, { useEffect, useRef, useCallback } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { playKeyClick } from "../sounds/audioEngine";

const PROMPT = "\r\n\x1b[32m>\x1b[0m \x1b[36m$\x1b[0m ";

export function Terminal({ onSubmit, feedback, nodeId }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const inputRef = useRef("");
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);

  const writePrompt = useCallback(() => {
    termRef.current?.write(PROMPT);
  }, []);

  // Initialize xterm
  useEffect(() => {
    const term = new XTerm({
      theme: {
        background: "#050810",
        foreground: "#00ff88",
        cursor: "#00ff88",
        cursorAccent: "#050810",
        selection: "rgba(0,255,136,0.2)",
        black: "#050810",
        green: "#00ff88",
        cyan: "#00e5ff",
        yellow: "#ffee00",
        red: "#ff2244",
        magenta: "#ff00aa",
        white: "#ccffee",
        brightGreen: "#44ffaa",
        brightCyan: "#55ffff",
      },
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "block",
      convertEol: true,
      scrollback: 200,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();

    termRef.current = term;
    fitRef.current = fit;

    // Welcome banner
    term.writeln("\x1b[36m╔══════════════════════════════════════╗\x1b[0m");
    term.writeln("\x1b[36m║  \x1b[32mNEXUS-7 // QUERY INTERFACE v2.099  \x1b[36m║\x1b[0m");
    term.writeln("\x1b[36m╚══════════════════════════════════════╝\x1b[0m");
    term.writeln("\x1b[33m[!] ESCRIBE TU QUERY Y PRESIONA ENTER\x1b[0m");
    term.writeln("\x1b[33m[!] COMANDOS: hint1 | hint2 | clear\x1b[0m");
    writePrompt();

    // Key handler
    term.onKey(({ key, domEvent }) => {
      const code = domEvent.keyCode;

      if (code === 13) {
        // Enter
        const cmd = inputRef.current.trim();
        term.write("\r\n");
        if (cmd) {
          historyRef.current.unshift(cmd);
          historyIdxRef.current = -1;
          onSubmit(cmd);
        }
        inputRef.current = "";
        return;
      }

      if (code === 8) {
        // Backspace
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          term.write("\b \b");
        }
        return;
      }

      if (code === 38) {
        // Arrow up — history
        const hist = historyRef.current;
        if (hist.length > 0) {
          historyIdxRef.current = Math.min(historyIdxRef.current + 1, hist.length - 1);
          const cmd = hist[historyIdxRef.current];
          // Clear current input
          term.write("\b \b".repeat(inputRef.current.length));
          inputRef.current = cmd;
          term.write(cmd);
        }
        return;
      }

      if (code === 40) {
        // Arrow down
        if (historyIdxRef.current > 0) {
          historyIdxRef.current--;
          const cmd = historyRef.current[historyIdxRef.current];
          term.write("\b \b".repeat(inputRef.current.length));
          inputRef.current = cmd;
          term.write(cmd);
        } else if (historyIdxRef.current === 0) {
          historyIdxRef.current = -1;
          term.write("\b \b".repeat(inputRef.current.length));
          inputRef.current = "";
        }
        return;
      }

      // Printable characters
      if (key.length === 1) {
        playKeyClick();
        inputRef.current += key;
        term.write(key);
      }
    });

    const handleResize = () => fit.fit();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  // Write feedback to terminal
  useEffect(() => {
    if (!feedback || !termRef.current) return;
    const term = termRef.current;
    const { ok, message, results } = feedback;

    if (ok) {
      term.writeln(`\x1b[32m${message}\x1b[0m`);
      if (results?.length) {
        results.forEach((r) => {
          term.writeln(`\x1b[33m  → ${JSON.stringify(r)}\x1b[0m`);
        });
      }
    } else {
      term.writeln(`\x1b[31m${message}\x1b[0m`);
    }
    writePrompt();
  }, [feedback, writePrompt]);

  // Handle special commands from parent
  useEffect(() => {
    if (!termRef.current) return;
    // expose write method via ref so App can write hints
  }, []);

  // Expose writeToTerminal globally via window for hints
  useEffect(() => {
    window.__nexusWriteHint = (msg) => {
      if (termRef.current) {
        termRef.current.writeln(`\x1b[35m${msg}\x1b[0m`);
        writePrompt();
      }
    };
    return () => { window.__nexusWriteHint = null; };
  }, [writePrompt]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: "#050810",
        padding: "8px",
        overflow: "hidden",
      }}
    />
  );
}
