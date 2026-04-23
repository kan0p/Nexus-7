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
  // Cursor position within inputRef.current (0 .. inputRef.current.length).
  // When the user presses left/right arrows we move this marker and emit
  // ANSI cursor-move codes so insertions/deletes happen at the right spot.
  const cursorRef = useRef(0);
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

    // Replaces the current input line with `next`, resets cursor to end.
    // Used by history navigation (arrow up/down).
    const replaceLine = (next) => {
      // Move cursor back to start of input, then clear to end of line.
      const backCount = cursorRef.current;
      if (backCount > 0) term.write(`\x1b[${backCount}D`);
      term.write("\x1b[K");
      term.write(next);
      inputRef.current = next;
      cursorRef.current = next.length;
    };

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
        cursorRef.current = 0;
        return;
      }

      if (code === 8) {
        // Backspace — delete the char at cursor-1
        const pos = cursorRef.current;
        if (pos === 0) return;
        const input = inputRef.current;
        const next = input.slice(0, pos - 1) + input.slice(pos);
        const tail = next.slice(pos - 1);
        // Move cursor left, clear to end, rewrite tail, then reposition.
        term.write("\x1b[D\x1b[K" + tail);
        if (tail.length > 0) term.write(`\x1b[${tail.length}D`);
        inputRef.current = next;
        cursorRef.current = pos - 1;
        return;
      }

      if (code === 37) {
        // Arrow left
        if (cursorRef.current > 0) {
          cursorRef.current--;
          term.write("\x1b[D");
        }
        return;
      }

      if (code === 39) {
        // Arrow right
        if (cursorRef.current < inputRef.current.length) {
          cursorRef.current++;
          term.write("\x1b[C");
        }
        return;
      }

      if (code === 36) {
        // Home — jump to start of input
        if (cursorRef.current > 0) {
          term.write(`\x1b[${cursorRef.current}D`);
          cursorRef.current = 0;
        }
        return;
      }

      if (code === 35) {
        // End — jump to end of input
        const remaining = inputRef.current.length - cursorRef.current;
        if (remaining > 0) {
          term.write(`\x1b[${remaining}C`);
          cursorRef.current = inputRef.current.length;
        }
        return;
      }

      if (code === 46) {
        // Delete — remove char at cursor position
        const pos = cursorRef.current;
        const input = inputRef.current;
        if (pos >= input.length) return;
        const next = input.slice(0, pos) + input.slice(pos + 1);
        const tail = next.slice(pos);
        term.write("\x1b[K" + tail);
        if (tail.length > 0) term.write(`\x1b[${tail.length}D`);
        inputRef.current = next;
        return;
      }

      if (code === 38) {
        // Arrow up — history (older)
        const hist = historyRef.current;
        if (hist.length === 0) return;
        historyIdxRef.current = Math.min(historyIdxRef.current + 1, hist.length - 1);
        replaceLine(hist[historyIdxRef.current]);
        return;
      }

      if (code === 40) {
        // Arrow down — history (newer)
        if (historyIdxRef.current > 0) {
          historyIdxRef.current--;
          replaceLine(historyRef.current[historyIdxRef.current]);
        } else if (historyIdxRef.current === 0) {
          historyIdxRef.current = -1;
          replaceLine("");
        }
        return;
      }

      // Printable characters — insert at cursor
      if (key.length === 1) {
        playKeyClick();
        const pos = cursorRef.current;
        const input = inputRef.current;
        const tail = input.slice(pos);
        inputRef.current = input.slice(0, pos) + key + tail;
        cursorRef.current = pos + 1;
        // Write the new char + the tail, then move the cursor back over the tail.
        term.write(key + tail);
        if (tail.length > 0) term.write(`\x1b[${tail.length}D`);
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
