import Link from "next/link";

type GameHeroProps = {
  kicker: string;
  title: string;
  copy: string;
  chips: string[];
  tone: "sun" | "space";
};

// Coloured banner at the top of every game page.
export function GameHero({ kicker, title, copy, chips, tone }: GameHeroProps) {
  const space = tone === "space";
  return (
    <section
      className={`relative overflow-hidden border-b-[3px] border-ink ${space ? "bg-space text-white" : "bg-sun"}`}
      style={
        space
          ? { backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1.5px), radial-gradient(circle at 85% 10%, #7b5cff 0, transparent 50%), radial-gradient(circle at 10% 100%, #ff5fa2 0, transparent 40%)", backgroundSize: "26px 26px, 100% 100%, 100% 100%" }
          : { backgroundImage: "radial-gradient(circle at 90% 0%, #ff8a3d 0, transparent 45%), radial-gradient(circle at 0% 100%, #ff5fa2aa 0, transparent 40%)" }
      }
    >
      <div className="relative mx-auto w-full max-w-5xl px-5 pb-24 pt-8 md:pt-12">
        <Link href="/" className={`text-sm font-bold ${space ? "text-white/70 hover:text-white" : "text-ink/70 hover:text-ink"}`}>
          ← All games
        </Link>
        <p className={`chip mt-5 ${space ? "bg-bubble text-white" : "bg-white"}`}>{kicker}</p>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight md:text-7xl" style={{ textShadow: space ? "4px 4px 0 #1d1b3a" : "4px 4px 0 #ffffff" }}>
          {title}
        </h1>
        <p className={`mt-3 max-w-xl text-lg font-semibold ${space ? "text-white/85" : "text-ink/80"}`}>{copy}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="chip bg-white text-ink">
              {chip}
            </span>
          ))}
        </div>
      </div>
      <span aria-hidden="true" className="absolute -right-10 bottom-6 hidden animate-drift text-[9rem] md:block" style={{ ["--r" as string]: "-12deg" }}>
        {space ? "☄️" : "⚡"}
      </span>
    </section>
  );
}

export function InfoCard({ title, emoji, bg, children }: { title: string; emoji: string; bg: string; children: React.ReactNode }) {
  return (
    <article className="sticker p-6" style={{ background: bg }}>
      <span className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink bg-white text-2xl shadow-pop-sm">{emoji}</span>
      <h2 className="mt-4 font-display text-2xl font-bold">{title}</h2>
      <div className="mt-2 font-semibold leading-7 text-ink/75">{children}</div>
    </article>
  );
}
