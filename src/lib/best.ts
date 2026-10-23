// Personal bests live in this browser only.
const PREFIX = "typlay:best:";

export function readBest(key: string) {
  try {
    return Number(window.localStorage.getItem(PREFIX + key)) || 0;
  } catch {
    return 0;
  }
}

export function writeBest(key: string, value: number) {
  try {
    window.localStorage.setItem(PREFIX + key, String(value));
  } catch {
    // Private windows can block storage; the round still counts on screen.
  }
}
