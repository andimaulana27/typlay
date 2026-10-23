"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "?"],
] as const;

// Standard touch-typing zones: 0–3 left pinky→index, 4–7 right index→pinky, 8 thumbs.
const FINGER: Record<string, number> = {};
const ZONES = [
  ["q", "a", "z"],
  ["w", "s", "x"],
  ["e", "d", "c"],
  ["r", "f", "v", "t", "g", "b"],
  ["y", "h", "n", "u", "j", "m"],
  ["i", "k", ","],
  ["o", "l", "."],
  ["p", ";", "?", "!", "'"],
];
ZONES.forEach((keys, finger) => keys.forEach((key) => (FINGER[key] = finger)));
FINGER[" "] = 8;

const FINGER_NAMES = [
  "left pinky",
  "left ring finger",
  "left middle finger",
  "left index finger",
  "right index finger",
  "right middle finger",
  "right ring finger",
  "right pinky",
  "thumb",
];

// Mirrored so the same finger has the same colour on both hands.
const FINGER_COLORS = ["#ff5fa2", "#ff8a3d", "#ffc53d", "#22d3a0", "#22d3a0", "#ffc53d", "#ff8a3d", "#ff5fa2", "#7b5cff"];
const FINGER_SOFT = ["#ffe1ee", "#ffe6d5", "#fff1c7", "#d5f8ec", "#d5f8ec", "#fff1c7", "#ffe6d5", "#ffe1ee", "#e9e3ff"];

export function fingerFor(key: string | undefined) {
  if (!key) return null;
  const finger = FINGER[key.toLowerCase()];
  if (finger === undefined) return null;
  return { name: FINGER_NAMES[finger], color: FINGER_COLORS[finger] };
}

type Pressed = { key: string; ok: boolean; id: number } | null;

export function Keyboard({ next, pressed }: { next?: string; pressed: Pressed }) {
  const [flash, setFlash] = useState<Pressed>(null);

  useEffect(() => {
    if (!pressed) return;
    setFlash(pressed);
    const timer = window.setTimeout(() => setFlash(null), 140);
    return () => window.clearTimeout(timer);
  }, [pressed]);

  const target = next?.toLowerCase();
  const finger = fingerFor(next);

  function cap(key: string, wide = false) {
    const zone = FINGER[key] ?? 8;
    const isNext = target === key;
    const isFlash = flash?.key.toLowerCase() === key;
    return (
      <span
        key={key}
        className={cn(
          "relative grid h-9 place-items-center rounded-[10px] border-2 border-ink font-mono text-xs font-bold uppercase text-ink shadow-[0_3px_0_#1d1b3a] transition-[transform,box-shadow,background-color] duration-100 sm:h-11 sm:text-sm",
          wide ? "col-span-6" : "",
          isNext && "z-10 -translate-y-1 scale-110 shadow-[0_5px_0_#1d1b3a]",
          isFlash && "translate-y-[3px] scale-100 shadow-none",
        )}
        style={{
          background: isFlash ? (flash?.ok ? "#ffffff" : "#ff5a5f") : isNext ? FINGER_COLORS[zone] : FINGER_SOFT[zone],
        }}
      >
        {key === " " ? "space" : key}
        {key === "f" || key === "j" ? <i className="absolute bottom-1 h-[3px] w-3 rounded bg-ink/60" /> : null}
        {isNext ? <i className="absolute -inset-1.5 animate-ping rounded-[12px] border-2" style={{ borderColor: FINGER_COLORS[zone] }} /> : null}
      </span>
    );
  }

  return (
    <div aria-hidden="true" className="select-none">
      <div className="mx-auto grid max-w-2xl gap-1.5 sm:gap-2">
        {ROWS.map((row, index) => (
          <div key={index} className="grid grid-cols-10 gap-1.5 sm:gap-2" style={{ paddingLeft: `${index * 3}%`, paddingRight: `${(2 - index) * 3}%` }}>
            {row.map((key) => cap(key))}
          </div>
        ))}
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
          <span className="col-span-2" />
          {cap(" ", true)}
        </div>
      </div>
      <div className="mt-5 flex min-h-8 justify-center">
        {finger ? (
          <p className="chip bg-white text-ink">
            <span className="h-3 w-3 rounded-full border-2 border-ink" style={{ background: finger.color }} />
            Press <b className="font-mono">{next === " " ? "space" : next}</b> with your {finger.name}
          </p>
        ) : null}
      </div>
    </div>
  );
}
