export function wordsPerMinute(correctCharacters: number, elapsedMs: number) {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60_000;
  return Math.round(correctCharacters / 5 / minutes);
}

export function accuracyPercent(correctCharacters: number, keystrokes: number) {
  if (keystrokes <= 0) return 100;
  return Math.round((correctCharacters / keystrokes) * 100);
}

// Consecutive correct keys needed for each score multiplier (x1, x2, x3, x4).
export const COMBO_STEPS = [0, 15, 40, 80] as const;

export function multiplierFor(combo: number) {
  let multiplier = 1;
  COMBO_STEPS.forEach((at, index) => {
    if (combo >= at) multiplier = index + 1;
  });
  return multiplier;
}

export const RANKS = [
  { min: 0, title: "Key Hunter", note: "Eyes on the screen, fingers on the home row. It gets easier fast." },
  { min: 20, title: "Steady Hands", note: "Solid rhythm. Push accuracy first — speed follows." },
  { min: 35, title: "Swift Fingers", note: "Faster than most people. Keep those combos alive." },
  { min: 50, title: "Speed Demon", note: "Professional-level typing. Try a longer round." },
  { min: 70, title: "Keyboard Legend", note: "Top-tier speed. Can you hold it for 60 seconds?" },
  { min: 100, title: "Hyperdrive", note: "That is elite. Screenshot it." },
] as const;

export function rankFor(wpm: number) {
  return [...RANKS].reverse().find((rank) => wpm >= rank.min) ?? RANKS[0];
}
