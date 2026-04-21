// src/App.jsx
import React, { useState, useCallback } from "react";
import { NODES, MAX_LIVES, ERRORS_PER_TRAP } from "./data/nodes";
import { useQueryEvaluator } from "./hooks/useQueryEvaluator";
import { HUD } from "./components/HUD";
import { NarrativePanel } from "./components/NarrativePanel";
import { DataPanel } from "./components/DataPanel";
import { Terminal } from "./components/Terminal";
import { TrapOverlay } from "./components/TrapOverlay";
import { IntroScreen } from "./components/IntroScreen";
import { GameOverScreen, VictoryScreen } from "./components/EndScreens";
import { playError, playSuccess, playTrap, playEMP } from "./sounds/audioEngine";
import "./styles/global.css";

// Game phases
const PHASE = {
  INTRO: "intro",
  PLAYING: "playing",
  GAME_OVER: "gameover",
  VICTORY: "victory",
};

function getInitialState() {
  return {
    phase: PHASE.INTRO,
    nodeIndex: 0,
    lives: MAX_LIVES,
    errors: 0,        // errors in current node
    trap: null,       // active trap animation
    feedback: null,   // last terminal feedback
    trapDamageQueued: false,
  };
}

export default function App() {
  const [state, setState] = useState(getInitialState);
  const { evaluate } = useQueryEvaluator();

  const currentNode = NODES[state.nodeIndex];

  const handleStart = useCallback(() => {
    setState((s) => ({ ...s, phase: PHASE.PLAYING }));
  }, []);

  const handleRestart = useCallback(() => {
    setState(getInitialState());
  }, []);

  const handleSubmit = useCallback((rawInput) => {
    // Special commands
    if (rawInput.toLowerCase() === "clear") {
      window.__nexusClear?.();
      return;
    }

    const result = evaluate(rawInput, currentNode);

    if (result.ok) {
      // Correct!
      playSuccess();
      setState((s) => {
        const nextIndex = s.nodeIndex + 1;
        if (nextIndex >= NODES.length) {
          return { ...s, feedback: result, phase: PHASE.VICTORY };
        }
        return {
          ...s,
          feedback: result,
          nodeIndex: nextIndex,
          errors: 0,
        };
      });
    } else {
      // Wrong
      playError();
      setState((s) => {
        const newErrors = s.errors + 1;
        if (newErrors >= ERRORS_PER_TRAP) {
          // Activate trap
          playTrap();
          if (currentNode.trapType === "emp") playEMP();
          const newLives = s.lives - 1;
          const trapData = {
            type: currentNode.trapType,
            message: currentNode.trapMsg,
          };
          if (newLives <= 0) {
            // Will transition to game over after trap animation
            return { ...s, feedback: result, errors: 0, trap: trapData, lives: 0 };
          }
          return { ...s, feedback: result, errors: 0, lives: newLives, trap: trapData };
        }
        return { ...s, feedback: result, errors: newErrors };
      });
    }
  }, [evaluate, currentNode]);

  const handleTrapDone = useCallback(() => {
    setState((s) => {
      const next = { ...s, trap: null };
      if (s.lives <= 0) next.phase = PHASE.GAME_OVER;
      return next;
    });
  }, []);

  if (state.phase === PHASE.INTRO) {
    return <IntroScreen onStart={handleStart} />;
  }

  if (state.phase === PHASE.GAME_OVER) {
    return <GameOverScreen onRestart={handleRestart} />;
  }

  if (state.phase === PHASE.VICTORY) {
    return <VictoryScreen onRestart={handleRestart} />;
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
      background: "var(--bg-black)",
    }}>
      {/* HUD */}
      <HUD
        lives={state.lives}
        currentNode={state.nodeIndex}
        totalNodes={NODES.length}
        errors={state.errors}
      />

      {/* Main layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left column: narrative + data */}
        <div style={{
          width: "380px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(0,255,136,0.2)",
          overflow: "hidden",
        }}>
          <NarrativePanel node={currentNode} key={state.nodeIndex} />
          <DataPanel node={currentNode} />
        </div>

        {/* Right column: terminal */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 16px",
            borderBottom: "1px solid rgba(0,255,136,0.15)",
            fontFamily: "var(--font-display)",
            fontSize: "10px",
            letterSpacing: "0.3em",
            color: "rgba(0,229,255,0.6)",
          }}>
            TERMINAL — db.{currentNode.collection}
            <span style={{
              float: "right",
              color: "rgba(0,255,136,0.4)",
              fontSize: "9px",
            }}>
              PISTAS DISPONIBLES: hint1 / hint2
            </span>
          </div>
          <Terminal
            onSubmit={handleSubmit}
            feedback={state.feedback}
            nodeId={state.nodeIndex}
          />
        </div>
      </div>

      {/* Trap overlay */}
      {state.trap && (
        <TrapOverlay trap={state.trap} onDone={handleTrapDone} />
      )}
    </div>
  );
}
