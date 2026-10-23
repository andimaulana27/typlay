import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { GameHero, InfoCard } from "@/components/game-hero";
import { MeteorDefense } from "@/components/meteor-defense";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Meteor Defense — Free Typing Shooter Game",
  description: "Type falling words to shoot meteors before they hit your ship. A free arcade typing game with waves, bosses, combos and EMP blasts.",
  alternates: { canonical: "/meteor-defense" },
};

export default function MeteorDefensePage() {
  return (
    <main>
      <GameHero
        tone="space"
        kicker="☄️ Mode 02 · Space arcade"
        title="Meteor Defense"
        copy="Words are falling from the sky. Type them to fire your lasers and keep the planet safe!"
        chips={["🌊 Endless waves", "👾 Boss meteors", "💥 EMP blast", "❤️ 3 lives"]}
      />

      <div className="relative mx-auto -mt-16 w-full max-w-5xl px-5">
        <MeteorDefense />
      </div>

      <section className="mx-auto mt-16 grid w-full max-w-5xl gap-6 px-5 md:grid-cols-3">
        <InfoCard title="Lock on" emoji="🎯" bg="#ffe1ee">
          <p>
            Type the first letter of any meteor to target it, then finish the word to destroy it. Every meteor starts with a different letter.
            Backspace drops your target.
          </p>
        </InfoCard>
        <InfoCard title="Survive the waves" emoji="🌊" bg="#dbf1ff">
          <p>
            Each wave brings more meteors, longer words and more speed. Every third wave a giant boss meteor appears — it costs two lives if it
            lands!
          </p>
        </InfoCard>
        <InfoCard title="EMP blast" emoji="💥" bg="#e9e3ff">
          <p>Press enter to wipe the whole screen when things get crowded. You start with one charge and earn more as you clear waves.</p>
        </InfoCard>
      </section>

      <AdSlot slot={site.ads.slots.inline} className="mx-auto mt-14 w-full max-w-5xl px-5" />

      <section className="mx-auto mt-14 w-full max-w-5xl px-5">
        <Link href="/word-rush" className="group sticker flex flex-wrap items-center justify-between gap-4 bg-sun p-6 shadow-pop-lg transition hover:-translate-y-1">
          <div>
            <p className="font-display text-sm font-bold uppercase text-ink/70">Next up</p>
            <p className="font-display text-3xl font-bold">⚡ Measure your speed in Word Rush</p>
          </div>
          <span className="btn bg-bubble text-white">Play →</span>
        </Link>
      </section>
    </main>
  );
}
