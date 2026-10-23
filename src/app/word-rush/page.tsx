import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { GameHero, InfoCard } from "@/components/game-hero";
import { WordRush } from "@/components/word-rush";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Word Rush — Free Typing Speed Test Game",
  description: "Test your typing speed in a 15, 30 or 60 second sprint. Build combos, earn multipliers and learn which finger hits every key.",
  alternates: { canonical: "/word-rush" },
};

const MULTIPLIERS = [
  { label: "x1", at: "start", color: "#38b6ff" },
  { label: "x2", at: "15 keys", color: "#22d3a0" },
  { label: "x3", at: "40 keys", color: "#ff5fa2" },
  { label: "x4", at: "80 keys", color: "#7b5cff" },
];

export default function WordRushPage() {
  return (
    <main>
      <GameHero
        tone="sun"
        kicker="⚡ Mode 01 · Speed sprint"
        title="Word Rush"
        copy="Beat the clock, keep the combo alive and find out how fast your fingers really are."
        chips={["⏱ 15 · 30 · 60 seconds", "🎯 3 levels", "🖐 Finger guide", "🔊 Fun sounds"]}
      />

      <div className="relative mx-auto -mt-16 w-full max-w-5xl px-5">
        <WordRush />
      </div>

      <section className="mx-auto mt-16 grid w-full max-w-5xl gap-6 px-5 md:grid-cols-3">
        <InfoCard title="How to play" emoji="🎮" bg="#dbf1ff">
          <p>The timer starts on your first key. Type the words exactly, spaces included. Press tab or esc any time to restart.</p>
        </InfoCard>
        <InfoCard title="Combo power" emoji="🔥" bg="#ffe1ee">
          <p>Every correct key scores 10 points times your multiplier. Clean words give a bonus.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MULTIPLIERS.map((item) => (
              <span key={item.label} className="chip text-white" style={{ background: item.color }}>
                {item.label} <span className="font-semibold opacity-85">{item.at}</span>
              </span>
            ))}
          </div>
        </InfoCard>
        <InfoCard title="Pick your level" emoji="🎯" bg="#d5f8ec">
          <ul className="grid gap-1">
            <li>🏠 <b>Home row</b> — only the middle keys, great for beginners.</li>
            <li>📖 <b>Common</b> — the most-used English words.</li>
            <li>🔥 <b>Pro</b> — long words and punctuation.</li>
          </ul>
        </InfoCard>
      </section>

      <AdSlot slot={site.ads.slots.inline} className="mx-auto mt-14 w-full max-w-5xl px-5" />

      <section className="mx-auto mt-14 w-full max-w-5xl px-5">
        <Link
          href="/meteor-defense"
          className="group sticker flex flex-wrap items-center justify-between gap-4 bg-space p-6 text-white shadow-pop-lg transition hover:-translate-y-1"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.5px)", backgroundSize: "24px 24px" }}
        >
          <div>
            <p className="font-display text-sm font-bold uppercase text-sun">Next up</p>
            <p className="font-display text-3xl font-bold">☄️ Defend the planet in Meteor Defense</p>
          </div>
          <span className="btn bg-sun text-ink">Launch →</span>
        </Link>
      </section>
    </main>
  );
}
