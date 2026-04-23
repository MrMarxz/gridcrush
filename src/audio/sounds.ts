// All sounds generated via Web Audio API — no audio files.
// AudioContext is lazy-initialised on the first call (browser requires a user gesture first).

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  // Resume if suspended (some browsers auto-suspend on page load)
  if (_ctx.state === 'suspended') void _ctx.resume();
  return _ctx;
}

function scheduleNote(
  frequency: number,
  durationSec: number,
  type: OscillatorType,
  startTime: number,
): void {
  const ac = ctx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.25, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);
  osc.start(startTime);
  osc.stop(startTime + durationSec + 0.01);
}

export function playTone(frequency: number, durationMs: number, type: OscillatorType = 'sine'): void {
  scheduleNote(frequency, durationMs / 1000, type, ctx().currentTime);
}

export function playPlace(muted: boolean): void {
  if (muted) return;
  scheduleNote(440, 0.08, 'sine', ctx().currentTime);
}

export function playClear(linesCleared: number, muted: boolean, comboLevel: number): void {
  if (muted) return;
  const ac = ctx();
  const now = ac.currentTime;

  if (linesCleared === 1) {
    scheduleNote(660, 0.15, 'triangle', now);
  } else {
    // Ascending 3-note arpeggio for 2+ lines
    scheduleNote(660,  0.10, 'triangle', now);
    scheduleNote(880,  0.10, 'triangle', now + 0.10);
    scheduleNote(1100, 0.10, 'triangle', now + 0.20);
  }

  // Combo (level ≥ 2): add a higher harmonic on top
  if (comboLevel >= 2) {
    scheduleNote(1320, 0.10, 'sine', now);
  }
}

export function playGameOver(muted: boolean): void {
  if (muted) return;
  const ac = ctx();
  const now = ac.currentTime;
  scheduleNote(440, 0.20, 'sine', now);
  scheduleNote(370, 0.20, 'sine', now + 0.20);
  scheduleNote(294, 0.20, 'sine', now + 0.40);
}
