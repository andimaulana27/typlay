"use client";

// Tiny Web Audio synth: every sound is generated, so there are no audio files to load.
const STORAGE_KEY = "typlay:muted";

let context: AudioContext | null = null;
let muted = false;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    muted = false;
  }
}

export function isMuted() {
  load();
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Keep the in-memory value when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeMuted(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function audio() {
  load();
  if (muted || typeof window === "undefined") return null;
  if (!context) {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return null;
    context = new Context();
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

function tone(frequency: number, duration: number, type: OscillatorType, volume: number, slideTo?: number, delay = 0) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noise(duration: number, volume: number, cutoff: number) {
  const ctx = audio();
  if (!ctx) return;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 2;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  gain.gain.value = volume;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

// Pentatonic steps keep rising combos musical instead of shrill.
const SCALE = [0, 2, 4, 7, 9];

export const sfx = {
  key(combo: number) {
    const step = combo % 15;
    const semitone = SCALE[step % 5] + 12 * Math.floor(step / 5);
    tone(440 * 2 ** (semitone / 12), 0.06, "triangle", 0.05);
  },
  miss() {
    tone(150, 0.14, "sawtooth", 0.05, 90);
  },
  word() {
    tone(880, 0.08, "sine", 0.05);
    tone(1320, 0.1, "sine", 0.04, undefined, 0.05);
  },
  combo() {
    [0, 4, 7, 12].forEach((semitone, index) => tone(523 * 2 ** (semitone / 12), 0.12, "square", 0.035, undefined, index * 0.06));
  },
  laser() {
    tone(1400, 0.07, "square", 0.025, 500);
  },
  boom() {
    noise(0.35, 0.22, 900);
    tone(110, 0.25, "sine", 0.12, 40);
  },
  hurt() {
    noise(0.5, 0.3, 500);
    tone(90, 0.45, "sawtooth", 0.08, 35);
  },
  emp() {
    tone(200, 0.6, "sawtooth", 0.06, 1800);
    noise(0.6, 0.18, 2400);
  },
  start() {
    [0, 7, 12].forEach((semitone, index) => tone(392 * 2 ** (semitone / 12), 0.1, "triangle", 0.05, undefined, index * 0.08));
  },
  finish() {
    [12, 7, 4, 12, 16].forEach((semitone, index) => tone(392 * 2 ** (semitone / 12), 0.16, "triangle", 0.05, undefined, index * 0.09));
  },
};
