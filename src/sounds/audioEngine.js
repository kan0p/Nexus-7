// src/sounds/audioEngine.js
// All sounds generated programmatically via Web Audio API.
// Every note uses an explicit gain envelope (attack + exponential decay)
// to avoid click/pop artifacts that happen when gain jumps abruptly.

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

// Resume the AudioContext if it was created before the user gesture.
// Browsers suspend contexts created without a gesture; ctx.resume() requires
// a gesture to succeed. We call this at the top of every play fn as a cheap
// no-op safety net.
function ensureCtx() {
  const ac = getCtx();
  if (ac.state === "suspended") ac.resume().catch(() => {});
  return ac;
}

// Auto-unlock on the first user gesture anywhere on the page, so sounds
// queued during the intro (before a click) start working once the user
// interacts.
if (typeof window !== "undefined") {
  const unlock = () => {
    const ac = getCtx();
    if (ac.state === "suspended") ac.resume().catch(() => {});
  };
  ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
    document.addEventListener(ev, unlock, { once: true, capture: true })
  );
}

// Schedule an oscillator with a smooth envelope. Returns nothing.
function blip(ac, { type, freq, peak, attack = 0.004, decay, startAt = 0 }) {
  const now = ac.currentTime + startAt;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  if (typeof freq === "function") freq(o, now);
  else o.frequency.value = freq;
  o.connect(g);
  g.connect(ac.destination);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(peak, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
  o.start(now);
  o.stop(now + decay + 0.02);
}

// Soft mechanical key click — triangle with short envelope, no pops
export function playKeyClick() {
  try {
    const ac = ensureCtx();
    blip(ac, {
      type: "triangle",
      freq: 620 + Math.random() * 120,
      peak: 0.05,
      attack: 0.002,
      decay: 0.035,
    });
  } catch (_) {}
}

// Success jingle — ascending arp
export function playSuccess() {
  try {
    const ac = ensureCtx();
    [440, 554, 659, 880].forEach((f, i) => {
      blip(ac, { type: "sine", freq: f, peak: 0.12, decay: 0.32, startAt: i * 0.1 });
    });
  } catch (_) {}
}

// Error buzz — low sawtooth
export function playError() {
  try {
    const ac = ensureCtx();
    blip(ac, { type: "sawtooth", freq: 120, peak: 0.15, decay: 0.42 });
  } catch (_) {}
}

// Trap alarm — rising siren, three pulses
export function playTrap() {
  try {
    const ac = ensureCtx();
    for (let i = 0; i < 3; i++) {
      blip(ac, {
        type: "sawtooth",
        freq: (o, t) => {
          o.frequency.setValueAtTime(300, t);
          o.frequency.linearRampToValueAtTime(600, t + 0.2);
        },
        peak: 0.2,
        decay: 0.24,
        startAt: i * 0.25,
      });
    }
  } catch (_) {}
}

// Game over — descending doom
export function playGameOver() {
  try {
    const ac = ensureCtx();
    [400, 300, 200, 100].forEach((f, i) => {
      blip(ac, { type: "sawtooth", freq: f, peak: 0.18, decay: 0.52, startAt: i * 0.3 });
    });
  } catch (_) {}
}

// Victory fanfare
export function playVictory() {
  try {
    const ac = ensureCtx();
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) => {
      blip(ac, { type: "sine", freq: f, peak: 0.14, decay: 0.28, startAt: i * 0.15 });
    });
  } catch (_) {}
}

// EMP — white noise burst with envelope
export function playEMP() {
  try {
    const ac = ensureCtx();
    const now = ac.currentTime;
    const bufferSize = ac.sampleRate * 0.8;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    const g = ac.createGain();
    src.buffer = buffer;
    src.connect(g);
    g.connect(ac.destination);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.3, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    src.start(now);
    src.stop(now + 0.85);
  } catch (_) {}
}

// ===== Intro sounds =====

// Low-to-mid sawtooth sweep — "booting up"
export function playIntroBoot() {
  try {
    const ac = ensureCtx();
    blip(ac, {
      type: "sawtooth",
      freq: (o, t) => {
        o.frequency.setValueAtTime(90, t);
        o.frequency.exponentialRampToValueAtTime(520, t + 0.55);
      },
      peak: 0.09,
      attack: 0.04,
      decay: 0.65,
    });
  } catch (_) {}
}

// Short beep on every narrative line that appears
export function playIntroLine() {
  try {
    const ac = ensureCtx();
    blip(ac, {
      type: "sine",
      freq: 280 + Math.random() * 100,
      peak: 0.07,
      attack: 0.005,
      decay: 0.12,
    });
  } catch (_) {}
}

// Two-note chime when the intro finishes and the button is ready
export function playIntroReady() {
  try {
    const ac = ensureCtx();
    [660, 880].forEach((f, i) => {
      blip(ac, { type: "sine", freq: f, peak: 0.1, decay: 0.35, startAt: i * 0.1 });
    });
  } catch (_) {}
}

// Ambient pad for the intro screen: two detuned sine oscillators at A2 plus
// a fifth harmonic, routed through a lowpass filter modulated by a slow LFO.
// Stays in the audible range (110 Hz fundamental, not the subsonic 55 Hz that
// made laptop speakers distort). Returns a stop() that fades out and cleans up.
export function startIntroAmbient() {
  try {
    const ac = ensureCtx();
    const now = ac.currentTime;

    const master = ac.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.18, now + 1.2);
    master.connect(ac.destination);

    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 1.2;
    filter.connect(master);

    const oscA = ac.createOscillator();
    oscA.type = "sine";
    oscA.frequency.value = 110;
    oscA.connect(filter);

    const oscB = ac.createOscillator();
    oscB.type = "sine";
    oscB.frequency.value = 110.6;
    oscB.connect(filter);

    const harmonic = ac.createOscillator();
    harmonic.type = "sine";
    harmonic.frequency.value = 165;
    const harmGain = ac.createGain();
    harmGain.gain.value = 0.35;
    harmonic.connect(harmGain);
    harmGain.connect(filter);

    // Slow filter-cutoff LFO to give it a "breathing" feel
    const lfo = ac.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.13;
    const lfoDepth = ac.createGain();
    lfoDepth.gain.value = 220;
    lfo.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);

    [oscA, oscB, harmonic, lfo].forEach((o) => o.start(now));

    return () => {
      try {
        const t = ac.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(0, t + 0.4);
        [oscA, oscB, harmonic, lfo].forEach((o) => {
          try { o.stop(t + 0.5); } catch (_) {}
        });
      } catch (_) {}
    };
  } catch (_) {
    return () => {};
  }
}

// Transition sweep — plays when the player clicks "INICIAR INFILTRACIÓN"
export function playIntroStart() {
  try {
    const ac = ensureCtx();
    blip(ac, {
      type: "sawtooth",
      freq: (o, t) => {
        o.frequency.setValueAtTime(200, t);
        o.frequency.exponentialRampToValueAtTime(800, t + 0.4);
        o.frequency.exponentialRampToValueAtTime(1400, t + 0.6);
      },
      peak: 0.13,
      attack: 0.03,
      decay: 0.7,
    });
  } catch (_) {}
}
