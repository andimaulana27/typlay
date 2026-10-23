"use client";

import { useEffect, useState } from "react";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const COLORS = ["#ff5fa2", "#ffc53d", "#22d3a0", "#38b6ff", "#7b5cff", "#ff8a3d"];
const DEMO = ["hello", "play", "faster", "combo", "win"];

// Self-typing demo keyboard for the hero.
export function Keycaps() {
  const [step, setStep] = useState({ word: 0, char: 0 });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStep(({ word, char }) => {
        const length = DEMO[word]?.length ?? 0;
        if (char < length + 5) return { word, char: char + 1 };
        return { word: (word + 1) % DEMO.length, char: 0 };
      });
    }, 180);
    return () => window.clearInterval(timer);
  }, []);

  const word = DEMO[step.word] ?? "";
  const typed = word.slice(0, step.char);
  const active = step.char > 0 && step.char <= word.length ? word[step.char - 1] : undefined;
  const color = COLORS[step.word % COLORS.length];

  return (
    <div aria-hidden="true">
      <div className="mb-5 flex h-14 items-center rounded-control border-[3px] border-ink bg-paper px-4 font-mono text-3xl font-bold">
        {typed.split("").map((char, index) => (
          <span key={`${step.word}-${index}`} className="inline-block animate-pop" style={{ color: COLORS[(index + step.word) % COLORS.length] }}>
            {char}
          </span>
        ))}
        <span className="ml-0.5 inline-block h-8 w-[4px] animate-blink rounded-full bg-ink" />
      </div>
      <div className="grid gap-2">
        {ROWS.map((row, rowIndex) => (
          <div key={row} className="flex gap-1.5" style={{ paddingLeft: rowIndex * 14 }}>
            {row.split("").map((key) => (
              <span
                key={key}
                className="grid h-10 flex-1 place-items-center rounded-[10px] border-2 border-ink bg-white font-mono text-xs font-bold uppercase transition-all duration-100"
                style={
                  active === key
                    ? { background: color, transform: "translateY(3px)", boxShadow: "0 0 0 #1d1b3a" }
                    : { boxShadow: "0 3px 0 #1d1b3a" }
                }
              >
                {key}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
