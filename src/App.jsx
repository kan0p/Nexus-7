// src/App.jsx
import React, { useState, useCallback, useMemo } from "react";
import { buildGameRun, MAX_LIVES, ERRORS_PER_TRAP } from "./levels/registry";
import { useQueryEvaluator } from "./hooks/useQueryEvaluator";
import { HUD } from "./components/HUD";
import { NarrativePanel } from "./components/NarrativePanel";
import { DataPanel } from "./components/DataPanel";
import { Terminal } from "./components/Terminal";
import { TrapOverlay } from "./components/TrapOverlay";
import { IntroScreen } from "./components/IntroScreen";
import { GameOverScreen, VictoryScreen } from "./components/EndScreens";
import { playError, playSuccess, playTrap, playEMP } from "./sounds/audioEngine";
import {
  levelAward,
  errorPenalty,
  hintPenalty,
  trapPenalty,
  clampScore,
} from "./scoring";
import { decodeHint } from "./levels/hintCodec";
import "./styles/global.css";

const PHASE = {
  INTRO: "intro",
  PLAYING: "playing",
  GAME_OVER: "gameover",
  VICTORY: "victory",
};

function initialState(scenarios) {
  return {
    phase: PHASE.INTRO,
    nodeIndex: 0,
    lives: MAX_LIVES,
    errors: 0,
    trap: null,
    feedback: null,
    score: 0,
    errorsTotal: 0,
    hintsTotal: 0,
    scenarios,
    levelStartedAt: null,
    runStartedAt: null,
  };
}

export default function App() {
  // A run = the scenarios produced by buildGameRun. Regenerated on every
  // restart so variants and carry differ between attempts.
  const [run, setRun] = useState(() => buildGameRun());
  const [state, setState] = useState(() => initialState(run.scenarios));
  const { evaluate } = useQueryEvaluator();

  const scenarios = state.scenarios;
  const currentScenario = scenarios[state.nodeIndex];

  const handleStart = useCallback(() => {
    const now = Date.now();
    setState((s) => ({
      ...s,
      phase: PHASE.PLAYING,
      runStartedAt: now,
      levelStartedAt: now,
    }));
  }, []);

  const handleRestart = useCallback(() => {
    const fresh = buildGameRun();
    setRun(fresh);
    setState(initialState(fresh.scenarios));
  }, []);

  // Every click of a hint button penalizes. No dedup — spam costs score.
  // We bump `penaltyTick` so the HUD can animate the drop visibly; a plain
  // counter is enough because React re-renders on any value change.
  const [penaltyTick, setPenaltyTick] = useState(0);
  const handleHintUsed = useCallback(() => {
    setState((s) => ({
      ...s,
      score: clampScore(s.score - hintPenalty()),
      hintsTotal: s.hintsTotal + 1,
    }));
    setPenaltyTick((t) => t + 1);
  }, []);

  const handleSubmit = useCallback((rawInput) => {
    const cmd = rawInput.trim().toLowerCase();
    if (cmd === "clear") {
      window.__nexusClear?.();
      return;
    }
    if (cmd === "hint1" || cmd === "hint2") {
      const n = cmd === "hint1" ? 1 : 2;
      const raw = n === 1 ? currentScenario.hints.hint1 : currentScenario.hints.hint2;
      const msg = decodeHint(raw);
      window.__nexusWriteHint?.(`[PISTA ${n}] ${msg}`);
      handleHintUsed();
      return;
    }

    const result = evaluate(rawInput, currentScenario);

    if (result.ok) {
      playSuccess();
      setState((s) => {
        const elapsed = Date.now() - (s.levelStartedAt || Date.now());
        const award = levelAward(elapsed);
        const nextIndex = s.nodeIndex + 1;
        const newScore = clampScore(s.score + award);

        if (nextIndex >= s.scenarios.length) {
          return {
            ...s,
            feedback: result,
            phase: PHASE.VICTORY,
            score: newScore,
          };
        }
        return {
          ...s,
          feedback: result,
          nodeIndex: nextIndex,
          errors: 0,
          score: newScore,
          levelStartedAt: Date.now(),
        };
      });
    } else {
      playError();
      setState((s) => {
        const newErrors = s.errors + 1;
        const afterErrorScore = clampScore(s.score - errorPenalty());
        if (newErrors >= ERRORS_PER_TRAP) {
          playTrap();
          if (currentScenario.trap.type === "emp") playEMP();
          const newLives = s.lives - 1;
          const trapData = {
            type: currentScenario.trap.type,
            message: currentScenario.trap.msg,
          };
          const withTrapPenalty = clampScore(afterErrorScore - trapPenalty());
          if (newLives <= 0) {
            return {
              ...s,
              feedback: result,
              errors: 0,
              errorsTotal: s.errorsTotal + 1,
              trap: trapData,
              lives: 0,
              score: withTrapPenalty,
            };
          }
          return {
            ...s,
            feedback: result,
            errors: 0,
            errorsTotal: s.errorsTotal + 1,
            lives: newLives,
            trap: trapData,
            score: withTrapPenalty,
          };
        }
        return {
          ...s,
          feedback: result,
          errors: newErrors,
          errorsTotal: s.errorsTotal + 1,
          score: afterErrorScore,
        };
      });
    }
  }, [evaluate, currentScenario, handleHintUsed]);

  const handleTrapDone = useCallback(() => {
    setState((s) => {
      const next = { ...s, trap: null };
      if (s.lives <= 0) next.phase = PHASE.GAME_OVER;
      return next;
    });
  }, []);

  const runData = useMemo(() => ({
    score: state.score,
    outcome: state.phase === PHASE.VICTORY ? "win" : "lose",
    nodesCompleted: state.phase === PHASE.VICTORY ? scenarios.length : state.nodeIndex,
    errors: state.errorsTotal,
    hints: state.hintsTotal,
    durationMs: state.runStartedAt ? Date.now() - state.runStartedAt : 0,
  }), [state, scenarios.length]);

  if (state.phase === PHASE.INTRO) {
    return <IntroScreen onStart={handleStart} />;
  }

  if (state.phase === PHASE.GAME_OVER) {
    return <GameOverScreen onRestart={handleRestart} runData={runData} />;
  }

  if (state.phase === PHASE.VICTORY) {
    return <VictoryScreen onRestart={handleRestart} runData={runData} />;
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
      background: "var(--bg-black)",
    }}>
      <HUD
        lives={state.lives}
        currentNode={state.nodeIndex}
        totalNodes={scenarios.length}
        errors={state.errors}
        score={state.score}
        penaltyTick={penaltyTick}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{
          width: "380px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(0,255,136,0.2)",
          overflow: "hidden",
        }}>
          <NarrativePanel
            scenario={currentScenario}
            totalNodes={scenarios.length}
            onHintUsed={handleHintUsed}
            key={state.nodeIndex}
          />
          <DataPanel scenario={currentScenario} />
        </div>

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
            TERMINAL — db.{currentScenario.collection}
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

      {state.trap && (
        <TrapOverlay trap={state.trap} onDone={handleTrapDone} />
      )}
    </div>
  );
}
