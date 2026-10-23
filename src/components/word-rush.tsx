"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Keyboard } from "@/components/keyboard";
import { readBest, writeBest } from "@/lib/best";
import { cn } from "@/lib/cn";
import { accuracyPercent, COMBO_STEPS, multiplierFor, rankFor, wordsPerMinute } from "@/lib/drills";
import { sfx } from "@/lib/sfx";
import { useParticles } from "@/lib/use-particles";
import { buildText, type Level } from "@/lib/words";

type Phase = "idle" | "running" | "done";

const DURATIONS = [15, 30, 60] as const;
type Duration = (typeof DURATIONS)[number];

const LEVELS: { id: Level; label: string; emoji: string; hint: string; color: string }[] = [
  { id: "home", label: "Home row", emoji: "🏠", hint: "a s d f g h j k l", color: "#22d3a0" },
  { id: "common", label: "Common", emoji: "📖", hint: "top English words", color: "#38b6ff" },
  { id: "pro", label: "Pro", emoji: "🔥", hint: "long words + punctuation", color: "#ff5fa2" },
];

const MULTIPLIER_COLORS = ["#38b6ff", "#22d3a0", "#ff5fa2", "#7b5cff"];
const CANDY = ["#ff5fa2", "#ffc53d", "#22d3a0", "#38b6ff", "#7b5cff", "#ff8a3d"];

type Stats = {
  correct: number;
  keys: number;
  combo: number;
  bestCombo: number;
  score: number;
  words: number;
  perfect: number;
  started: number;
  samples: number[];
};

type Result = {
  wpm: number;
  accuracy: number;
  bestCombo: number;
  score: number;
  words: number;
  perfect: number;
  samples: number[];
  best: number;
  newBest: boolean;
};

type Popup = { id: number; x: number; y: number; text: string; color: string };

const emptyStats = (): Stats => ({
  correct: 0,
  keys: 0,
  combo: 0,
  bestCombo: 0,
  score: 0,
  words: 0,
  perfect: 0,
  started: 0,
  samples: [],
});

export function WordRush() {
  const [level, setLevel] = useState<Level>("common");
  const [duration, setDuration] = useState<Duration>(30);
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState("");
  const [pos, setPos] = useState(0);
  const [remaining, setRemaining] = useState(30_000);
  const [hud, setHud] = useState({ combo: 0, score: 0, wpm: 0 });
  const [pressed, setPressed] = useState<{ key: string; ok: boolean; id: number } | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [banner, setBanner] = useState<{ id: number; text: string; color: string } | null>(null);
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 0 });
  const [shift, setShift] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [best, setBest] = useState(0);
  const [capsLock, setCapsLock] = useState(false);

  const stats = useRef<Stats>(emptyStats());
  const errors = useRef(new Set<number>());
  const charEls = useRef<(HTMLSpanElement | null)[]>([]);
  const cardRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);
  const { canvasRef, burst } = useParticles();

  const bestKey = `rush:${level}:${duration}`;
  const multiplier = multiplierFor(hud.combo);
  const multColor = MULTIPLIER_COLORS[multiplier - 1] ?? "#38b6ff";

  const words = useMemo(() => {
    const out: { start: number; word: string }[] = [];
    let start = 0;
    for (const word of text.split(" ")) {
      out.push({ start, word });
      start += word.length + 1;
    }
    return out;
  }, [text]);

  function reset() {
    stats.current = emptyStats();
    errors.current = new Set();
    setText(buildText(level, 90));
    setPos(0);
    setRemaining(duration * 1000);
    setHud({ combo: 0, score: 0, wpm: 0 });
    setPopups([]);
    setBanner(null);
    setResult(null);
    setShift(0);
    setPhase("idle");
  }

  // New text whenever the round settings change.
  useEffect(() => {
    reset();
    setBest(readBest(`rush:${level}:${duration}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, duration]);

  useEffect(() => {
    if (phase !== "running") return;
    const total = duration * 1000;
    let sampled = 0;

    function finish() {
      const s = stats.current;
      const previous = readBest(bestKey);
      const newBest = s.score > previous;
      if (newBest) writeBest(bestKey, s.score);
      setBest(Math.max(previous, s.score));
      setResult({
        wpm: wordsPerMinute(s.correct, total),
        accuracy: accuracyPercent(s.correct, s.keys),
        bestCombo: s.bestCombo,
        score: s.score,
        words: s.words,
        perfect: s.perfect,
        samples: s.samples,
        best: Math.max(previous, s.score),
        newBest,
      });
      setPhase("done");
      sfx.finish();
      const card = cardRef.current;
      if (newBest && card) {
        burst(card.clientWidth / 2, card.clientHeight * 0.3, { count: 110, confetti: true, speed: 680, colors: CANDY });
      }
    }

    const timer = window.setInterval(() => {
      const elapsed = performance.now() - stats.current.started;
      const left = Math.max(0, total - elapsed);
      const wpm = wordsPerMinute(stats.current.correct, elapsed);
      setRemaining(left);
      setHud((current) => ({ ...current, wpm }));
      const second = Math.floor(elapsed / 1000);
      if (second > sampled) {
        sampled = second;
        stats.current.samples.push(wpm);
      }
      if (left <= 0) {
        window.clearInterval(timer);
        finish();
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, duration, bestKey, burst]);

  // Glide the caret to the active letter and scroll finished lines away.
  useLayoutEffect(() => {
    const el = charEls.current[pos];
    if (!el) return;
    const height = el.offsetHeight;
    setCaret({ x: el.offsetLeft, y: el.offsetTop, h: height });
    setShift(Math.max(0, el.offsetTop - height));
  }, [pos, text]);

  function caretPoint() {
    const el = charEls.current[pos];
    const card = cardRef.current;
    if (!el || !card) return { x: 0, y: 0 };
    const a = el.getBoundingClientRect();
    const b = card.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top + a.height / 2 };
  }

  function popup(text: string, color: string) {
    const id = ++seq.current;
    setPopups((list) => [...list.slice(-5), { id, x: caret.x, y: caret.y, text, color }]);
    window.setTimeout(() => setPopups((list) => list.filter((item) => item.id !== id)), 900);
  }

  function feed(ch: string) {
    if (phase === "done" || !text) return;
    const s = stats.current;
    if (phase === "idle") {
      s.started = performance.now();
      setPhase("running");
      sfx.start();
    }

    const expected = text[pos];
    const id = ++seq.current;
    s.keys += 1;

    if (ch !== expected) {
      errors.current.add(pos);
      s.combo = 0;
      setHud((current) => ({ ...current, combo: 0 }));
      setPressed({ key: ch, ok: false, id });
      sfx.miss();
      textRef.current?.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(7px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }],
        { duration: 240, easing: "ease-out" },
      );
      return;
    }

    const before = multiplierFor(s.combo);
    s.correct += 1;
    s.combo += 1;
    s.bestCombo = Math.max(s.bestCombo, s.combo);
    const mult = multiplierFor(s.combo);
    s.score += 10 * mult;
    setPressed({ key: ch, ok: true, id });
    sfx.key(s.combo);
    caretRef.current?.animate([{ transform: "scaleY(1.5)" }, { transform: "scaleY(1)" }], { duration: 120 });

    const point = caretPoint();
    if (mult > before) {
      const color = MULTIPLIER_COLORS[mult - 1] ?? "#ff5fa2";
      setBanner({ id, text: `x${mult} combo!`, color });
      window.setTimeout(() => setBanner((current) => (current?.id === id ? null : current)), 1100);
      sfx.combo();
      burst(point.x, point.y, { count: 60, speed: 460, colors: CANDY });
    }

    if (ch === " ") {
      s.words += 1;
      const start = text.lastIndexOf(" ", pos - 1) + 1;
      let clean = true;
      for (let index = start; index < pos; index += 1) {
        if (errors.current.has(index)) {
          clean = false;
          break;
        }
      }
      if (clean) {
        const bonus = 5 * (pos - start) * mult;
        s.perfect += 1;
        s.score += bonus;
        popup(`+${bonus}`, CANDY[s.perfect % CANDY.length] ?? "#ff5fa2");
        burst(point.x, point.y, { count: 14 + mult * 5, colors: CANDY });
        sfx.word();
      }
    }

    setHud((current) => ({ ...current, combo: s.combo, score: s.score }));
    setPos(pos + 1);
    if (pos + 1 > text.length - 80) setText((current) => `${current} ${buildText(level, 40)}`);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const el = event.target;
    if (el instanceof Element && el !== inputRef.current && el.closest("input, textarea, select, [contenteditable='true']")) return;
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);
    if (event.key === "Tab" || event.key === "Escape") {
      event.preventDefault();
      reset();
      return;
    }
    if (phase === "done") {
      if (event.key === "Enter") {
        event.preventDefault();
        reset();
      }
      return;
    }
    if (event.key.length !== 1) return;
    event.preventDefault();
    feed(event.key);
  }

  const keyHandler = useRef(onKeyDown);
  useEffect(() => {
    keyHandler.current = onKeyDown;
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => keyHandler.current(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const progress = remaining / (duration * 1000);
  const comboNext = COMBO_STEPS[multiplier] ?? null;
  const comboFloor = COMBO_STEPS[multiplier - 1] ?? 0;
  const comboFill = comboNext ? (hud.combo - comboFloor) / (comboNext - comboFloor) : 1;
  const locked = phase === "running";
  const hurry = remaining < 5000 && locked;

  return (
    <div>
      <div className={cn("mb-5 flex flex-wrap items-center gap-3 transition-opacity", locked && "pointer-events-none opacity-40")}>
        <div className="flex gap-1 rounded-full border-[3px] border-ink bg-white p-1 shadow-pop-sm">
          {DURATIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={(event) => {
                setDuration(value);
                event.currentTarget.blur();
              }}
              className={cn("rounded-full px-4 py-1.5 font-mono text-sm font-bold transition", duration === value ? "bg-ink text-white" : "hover:bg-sun-soft")}
            >
              {value}s
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border-[3px] border-ink bg-white p-1 shadow-pop-sm">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.hint}
              onClick={(event) => {
                setLevel(item.id);
                event.currentTarget.blur();
              }}
              className="rounded-full px-3 py-1.5 text-sm font-bold transition hover:bg-paper"
              style={level === item.id ? { background: item.color } : undefined}
            >
              {item.emoji} {item.label}
            </button>
          ))}
        </div>
        <p className="chip ml-auto bg-sun">🏆 best {best.toLocaleString("en-US")}</p>
      </div>

      <section
        ref={cardRef}
        className="sticker relative overflow-hidden p-5 shadow-pop-lg transition-colors md:p-8"
        style={{ background: multiplier > 1 ? `color-mix(in srgb, ${multColor} 9%, white)` : undefined }}
      >
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Time" value={Math.ceil(remaining / 1000)} bg={hurry ? "#ff5a5f" : "#fff1c7"} pulse={hurry} />
          <Stat label="WPM" value={hud.wpm} bg="#dbf1ff" />
          <Stat label="Score" value={hud.score.toLocaleString("en-US")} bg="#d5f8ec" />
          <div className="rounded-control border-[3px] border-ink bg-bubble-soft px-3 py-2">
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink/60">Combo</p>
            <p className="flex items-center gap-2 font-mono text-2xl font-bold md:text-3xl">
              {hud.combo}
              <span key={multiplier} className="animate-pop rounded-full border-2 border-ink px-2 text-sm text-white" style={{ background: multColor }}>
                x{multiplier}
              </span>
            </p>
            <div className="mt-1 h-2 overflow-hidden rounded-full border-2 border-ink bg-white">
              <div className="h-full transition-[width] duration-150" style={{ width: `${comboFill * 100}%`, background: multColor }} />
            </div>
          </div>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full border-[3px] border-ink bg-paper">
          <div
            className="h-full transition-[width] duration-100 ease-linear"
            style={{
              width: `${progress * 100}%`,
              background: hurry ? "#ff5a5f" : "repeating-linear-gradient(-45deg, #ffc53d 0 10px, #ff8a3d 10px 20px)",
            }}
          />
        </div>

        {banner ? (
          <p
            key={banner.id}
            className="pointer-events-none absolute inset-x-0 top-1/3 z-10 animate-banner text-center font-display text-6xl font-bold uppercase tracking-tight md:text-8xl"
            style={{ color: banner.color, WebkitTextStroke: "3px #1d1b3a", textShadow: "5px 5px 0 #1d1b3a" }}
          >
            {banner.text}
          </p>
        ) : null}

        {phase === "done" && result ? (
          <Results result={result} level={level} duration={duration} onAgain={reset} />
        ) : (
          <>
            <div
              className="relative mt-6 cursor-text overflow-hidden rounded-control bg-white/80 px-1 font-mono text-[1.45rem] font-bold leading-[1.7] sm:text-[1.75rem] md:text-[2rem]"
              style={{ height: "5.1em" }}
              onClick={() => inputRef.current?.focus()}
            >
              <div ref={textRef}>
                <div className="relative transition-transform duration-200 ease-out" style={{ transform: `translateY(-${shift}px)` }}>
                  {words.map(({ start, word }, wordIndex) => (
                    <span key={`${start}-${word}`} className="inline-block whitespace-nowrap">
                      {[...word, ...(wordIndex < words.length - 1 ? [" "] : [])].map((char, offset) => {
                        const index = start + offset;
                        const done = index < pos;
                        const missed = errors.current.has(index);
                        return (
                          <span
                            key={index}
                            ref={(el) => {
                              charEls.current[index] = el;
                            }}
                            className={cn(
                              "inline-block transition-colors duration-100",
                              char === " " && "w-[0.6em]",
                              done ? (missed ? "text-coral underline decoration-wavy decoration-2" : "text-ink") : "text-ink/25",
                              done && missed && char === " " && "rounded bg-coral/30",
                              index === pos && missed && "text-coral",
                            )}
                          >
                            {char === " " ? " " : char}
                          </span>
                        );
                      })}
                    </span>
                  ))}
                  <span
                    ref={caretRef}
                    className={cn("absolute w-[4px] rounded-full transition-[left,top] duration-100 ease-out", phase === "idle" && "animate-blink")}
                    style={{ left: caret.x - 2, top: caret.y + caret.h * 0.14, height: caret.h * 0.72, background: multColor }}
                  />
                  {popups.map((item) => (
                    <span
                      key={item.id}
                      className="pointer-events-none absolute animate-float-up rounded-full border-2 border-ink px-2 font-display text-base font-bold text-ink"
                      style={{ left: caret.x - 28, top: caret.y - 14, background: item.color }}
                    >
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <input
              ref={inputRef}
              aria-label="Type here"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              className="absolute h-px w-px opacity-0"
              onInput={(event) => {
                const value = event.currentTarget.value;
                event.currentTarget.value = "";
                const char = value.slice(-1);
                if (char) feed(char);
              }}
            />
            <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2 text-sm font-bold text-mute">
              {capsLock ? (
                <span className="chip bg-coral text-white">⚠️ Caps Lock is on</span>
              ) : phase === "idle" ? (
                <>
                  <span className="chip animate-wiggle bg-sun text-ink">👉 Start typing to begin!</span>
                  <span>
                    <kbd className="rounded-md border-2 border-ink bg-white px-1.5 font-mono text-xs text-ink">tab</kbd> restarts
                  </span>
                </>
              ) : (
                <span>Clean words earn bonus points. A wrong key breaks your combo.</span>
              )}
            </div>
          </>
        )}
      </section>

      {phase !== "done" ? (
        <div className="sticker mt-6 bg-white/90 p-4 md:p-6">
          <Keyboard next={text[pos]} pressed={pressed} />
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, bg, pulse }: { label: string; value: number | string; bg: string; pulse?: boolean }) {
  return (
    <div className={cn("rounded-control border-[3px] border-ink px-3 py-2", pulse && "animate-wiggle text-white")} style={{ background: bg }}>
      <p className={cn("text-xs font-extrabold uppercase tracking-wide", pulse ? "text-white/80" : "text-ink/60")}>{label}</p>
      <p className="font-mono text-2xl font-bold tabular-nums md:text-3xl">{value}</p>
    </div>
  );
}

function useCountUp(target: number, ms = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return value;
}

function Results({ result, level, duration, onAgain }: { result: Result; level: Level; duration: number; onAgain: () => void }) {
  const wpm = useCountUp(result.wpm);
  const score = useCountUp(result.score, 1200);
  const rank = rankFor(result.wpm);
  const [copied, setCopied] = useState(false);

  const max = Math.max(10, ...result.samples);
  const points = result.samples
    .map((value, index) => `${(index / Math.max(1, result.samples.length - 1)) * 100},${40 - (value / max) * 36}`)
    .join(" ");

  async function share() {
    const line = `I typed ${result.wpm} WPM (${result.accuracy}% accuracy) in Word Rush on Typlay. Can you beat it? ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative mt-8 animate-enter">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className={cn("chip", result.newBest ? "animate-wiggle bg-bubble text-white" : "bg-mint")}>
            {result.newBest ? "🎉 New personal best!" : "✅ Round complete"} · {duration}s · {level}
          </span>
          <p className="mt-3 font-display text-8xl font-bold tabular-nums leading-none md:text-9xl" style={{ WebkitTextStroke: "2px #1d1b3a", color: "#ffc53d", textShadow: "5px 5px 0 #1d1b3a" }}>
            {wpm}
          </p>
          <p className="mt-2 font-display text-xl font-semibold">words per minute</p>
        </div>
        <div className="sticker rotate-2 bg-grape p-5 text-white">
          <p className="text-xs font-extrabold uppercase tracking-wide text-white/70">Your rank</p>
          <p className="mt-1 font-display text-3xl font-bold">{rank.title}</p>
          <p className="mt-1 max-w-[16rem] text-sm font-semibold text-white/85">{rank.note}</p>
        </div>
      </div>

      {result.samples.length > 1 ? (
        <div className="mt-6 rounded-control border-[3px] border-ink bg-sky-soft p-3">
          <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="h-20 w-full" aria-label="WPM over time">
            <polyline points={points} fill="none" stroke="#7b5cff" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
      ) : null}

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label="Score" value={score.toLocaleString("en-US")} bg="#d5f8ec" />
        <Fact label="Accuracy" value={`${result.accuracy}%`} bg="#dbf1ff" />
        <Fact label="Best combo" value={result.bestCombo} bg="#ffe1ee" />
        <Fact label="Clean words" value={`${result.perfect}/${result.words}`} bg="#fff1c7" />
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onAgain} className="btn bg-bubble text-white">
          🔁 Play again <span className="font-mono text-xs opacity-80">enter</span>
        </button>
        <button type="button" onClick={share} className="btn bg-white">
          {copied ? "✅ Copied!" : "📋 Copy result"}
        </button>
        <p className="chip bg-sun">🏆 best {result.best.toLocaleString("en-US")}</p>
      </div>
    </div>
  );
}

function Fact({ label, value, bg }: { label: string; value: number | string; bg: string }) {
  return (
    <div className="rounded-control border-[3px] border-ink px-4 py-3" style={{ background: bg }}>
      <dt className="text-xs font-extrabold uppercase tracking-wide text-ink/60">{label}</dt>
      <dd className="font-mono text-2xl font-bold">{value}</dd>
    </div>
  );
}
