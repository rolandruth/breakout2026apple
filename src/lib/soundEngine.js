import { hapticImpact, hapticNotify } from "./haptics";
// Web Audio API synthesized sound effects — no external files needed

let ctx = null;
let muted = false;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setMuted(val) { muted = val; }
export function getMuted() { return muted; }

function play(fn) {
  if (muted) return;
  try { fn(getCtx()); } catch (e) { /* ignore */ }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function osc(ac, type, freq, start, end, duration, gainStart, gainEnd, dest) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  o.frequency.exponentialRampToValueAtTime(end, start + duration);
  g.gain.setValueAtTime(gainStart, start);
  g.gain.exponentialRampToValueAtTime(gainEnd, start + duration);
  o.connect(g);
  g.connect(dest || ac.destination);
  o.start(start);
  o.stop(start + duration + 0.01);
}

function noise(ac, duration, gainVal, freq, dest) {
  const bufSize = ac.sampleRate * duration;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = 1;
  const g = ac.createGain();
  g.gain.setValueAtTime(gainVal, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(dest || ac.destination);
  src.start();
  src.stop(ac.currentTime + duration);
}

// ── Sound effects ─────────────────────────────────────────────────────────────

export function soundPaddleHit() {
  hapticImpact('light');
  play((ac) => {
    const t = ac.currentTime;
    osc(ac, "sine", 320, t, 180, 0.06, 0.3, 0.001);
  });
}

export function soundWallHit() {
  play((ac) => {
    const t = ac.currentTime;
    osc(ac, "triangle", 220, t, 160, 0.05, 0.15, 0.001);
  });
}

export function soundBrickHit() {
  play((ac) => {
    const t = ac.currentTime;
    osc(ac, "square", 440, t, 300, 0.07, 0.2, 0.001);
  });
}

export function soundBrickDestroy() {
  hapticImpact('medium');
  play((ac) => {
    const t = ac.currentTime;
    // Quick descending tone + noise burst
    osc(ac, "sawtooth", 600, t, 100, 0.12, 0.35, 0.001);
    noise(ac, 0.12, 0.15, 800);
  });
}

export function soundPowerupCatch() {
  hapticNotify('success');
  play((ac) => {
    const t = ac.currentTime;
    // Ascending arpeggio
    [523, 659, 784, 1047].forEach((freq, i) => {
      osc(ac, "sine", freq, t + i * 0.06, freq * 1.01, 0.1, 0.25, 0.001);
    });
  });
}

export function soundLaserFire() {
  play((ac) => {
    const t = ac.currentTime;
    osc(ac, "sawtooth", 900, t, 200, 0.09, 0.2, 0.001);
  });
}

export function soundLifeLost() {
  hapticNotify('error');
  play((ac) => {
    const t = ac.currentTime;
    osc(ac, "sawtooth", 300, t, 80, 0.5, 0.4, 0.001);
    osc(ac, "sine", 200, t + 0.15, 60, 0.5, 0.3, 0.001);
  });
}

export function soundLevelComplete() {
  hapticNotify('success');
  play((ac) => {
    const t = ac.currentTime;
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      osc(ac, "sine", freq, t + i * 0.08, freq, 0.15, 0.3, 0.001);
    });
  });
}

// ── Combo voice lines (synthesized) ──────────────────────────────────────────
export function soundComboVoice(combo) {
  play((ac) => {
    const t = ac.currentTime;
    if (combo >= 5) {
      // "Unstoppable!" — high energetic ascending burst
      [800, 1000, 1300, 1600].forEach((f, i) => {
        osc(ac, "sine", f, t + i * 0.055, f * 1.05, 0.12, 0.28, 0.001);
      });
      noise(ac, 0.15, 0.08, 1200);
    } else if (combo >= 3) {
      // "Combo!" — punchy double tone
      osc(ac, "sine", 660, t, 880, 0.1, 0.22, 0.001);
      osc(ac, "sine", 880, t + 0.07, 1100, 0.1, 0.2, 0.001);
    } else {
      // "Nice!" — short rising chirp
      osc(ac, "sine", 500, t, 700, 0.08, 0.18, 0.001);
    }
  });
}

// ── Dynamic background music ──────────────────────────────────────────────────
let musicTimeout = null;
let musicPlaying = false;
let musicBeat = 0;
let musicIntensity = 0; // 0-1, set externally

const MUSIC_NOTES = [110, 138.6, 164.8, 196, 220, 246.9, 293.7]; // A minor pentatonic-ish

function scheduleBeat(ac) {
  if (!musicPlaying || muted) return;

  const t = ac.currentTime;
  const bpm = 90 + musicIntensity * 70; // 90–160 bpm
  const interval = 60 / bpm;

  // Bass note every beat
  const bassNote = MUSIC_NOTES[musicBeat % MUSIC_NOTES.length];
  osc(ac, "triangle", bassNote, t, bassNote * 0.98, interval * 0.4, 0.07, 0.001);

  // Hi-hat (noise) on offbeats
  if (musicBeat % 2 === 1) {
    noise(ac, 0.05, 0.04, 8000);
  }

  // Accent melody note every 4 beats
  if (musicBeat % 4 === 0) {
    const melodyNote = MUSIC_NOTES[(musicBeat / 4) % MUSIC_NOTES.length] * 2;
    osc(ac, "sine", melodyNote, t + interval * 0.1, melodyNote * 1.01, interval * 0.3, 0.05, 0.001);
  }

  musicBeat++;
  const ms = interval * 1000;
  musicTimeout = setTimeout(() => scheduleBeat(getCtx()), ms * 0.95);
}

export function startMusic(intensity = 0) {
  if (musicPlaying) return;
  musicPlaying = true;
  musicBeat = 0;
  musicIntensity = intensity;
  try { scheduleBeat(getCtx()); } catch (e) { /* ignore */ }
}

export function stopMusic() {
  musicPlaying = false;
  if (musicTimeout) { clearTimeout(musicTimeout); musicTimeout = null; }
}

export function setMusicIntensity(val) {
  musicIntensity = Math.max(0, Math.min(1, val));
}

export function soundGameOver() {
  hapticImpact('heavy');
  play((ac) => {
    const t = ac.currentTime;
    [400, 300, 200, 150].forEach((freq, i) => {
      osc(ac, "sawtooth", freq, t + i * 0.15, freq * 0.5, 0.2, 0.35, 0.001);
    });
  });
}