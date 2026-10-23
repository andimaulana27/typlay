import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { Keycaps } from "@/components/keycaps";
import { RANKS } from "@/lib/drills";
import { site } from "@/lib/site";

const TITLE_COLORS = ["#ff5fa2", "#ffc53d", "#22d3a0", "#38b6ff", "#7b5cff"];
const RANK_COLORS = ["#ffe1ee", "#ffe6d5", "#fff1c7", "#d5f8ec", "#dbf1ff", "#e9e3ff"];
const MARQUEE = ["type", "play", "combo", "learn", "faster", "win", "focus", "level up", "have fun", "beat your best"];

const audiences = [
  { emoji: "🧒", title: "Kids", copy: "Big bright keys, a finger guide and a home-row level made for first-time typists.", bg: "bg-mint-soft" },
  { emoji: "🎒", title: "Students", copy: "Quick 30-second rounds between homework sessions. Type essays faster, finish sooner.", bg: "bg-sky-soft" },
  { emoji: "💼", title: "Grown-ups", copy: "Boost your words per minute for work, emails and chat — while actually having fun.", bg: "bg-bubble-soft" },
];

const flow = [
  { title: "Pick a game", copy: "Sprint in Word Rush or blast meteors in Meteor Defense.", color: "#ffc53d" },
  { title: "Play a round", copy: "Rounds take under two minutes. Combos and sounds keep you going.", color: "#ff5fa2" },
  { title: "Beat your best", copy: "Your high score is saved. Come back tomorrow and top it.", color: "#22d3a0" },
];

const steps = [
  {
    title: "Find the home row",
    copy: "Rest your left fingers on A S D F and your right fingers on J K L ;. The bumps on F and J help you find your way back without looking.",
  },
  {
    title: "Own your finger zones",
    copy: "Each finger covers one slanted column of keys. In Word Rush the next key glows in its finger's colour so you always know who presses it.",
  },
  {
    title: "Accuracy before speed",
    copy: "A wrong key breaks your combo for a reason. Clean, steady typing beats fast typing with lots of corrections.",
  },
  {
    title: "Stop looking down",
    copy: "Keep your eyes on the screen. It feels slow for a few days, then you overtake your old hunt-and-peck speed.",
  },
  {
    title: "Practise little and often",
    copy: "Ten minutes a day beats one long session. A few sprints and one Meteor Defense run is the perfect daily dose.",
  },
];

const faqs = [
  {
    q: "Is Typlay really free?",
    a: "Yes. Every game is free to play in your browser with no account or download. The site is supported by ads.",
  },
  {
    q: "Is it good for kids?",
    a: "Yes! The Home row level and the colour finger guide are made for beginners of any age. There is no chat and no sign-up.",
  },
  {
    q: "What is a good typing speed?",
    a: "Most people type around 35–40 words per minute. 50+ WPM is fast, and 70+ WPM puts you among the quickest typists.",
  },
  {
    q: "How is WPM calculated?",
    a: "We count every correctly typed character, divide by five (the standard word length) and scale it to one minute.",
  },
  {
    q: "Can I play on a phone or tablet?",
    a: "You can tap the game to open your on-screen keyboard, but the games are designed for a physical keyboard, where touch typing really matters.",
  },
  {
    q: "Are my scores saved?",
    a: "Your personal bests are stored in this browser only. Clearing site data resets them.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: site.name,
  url: site.url,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: site.description,
};

function SectionTitle({ kicker, title, color }: { kicker: string; title: React.ReactNode; color: string }) {
  return (
    <div className="text-center">
      <span className="chip" style={{ background: color }}>
        {kicker}
      </span>
      <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h2>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-col gap-24 pb-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([siteJsonLd, faqJsonLd]) }} />

      {/* Hero */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pt-10 md:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
        <Blob className="-left-24 top-0 h-72 w-72 bg-bubble/25" />
        <Blob className="right-0 top-40 h-80 w-80 bg-sky/25" />

        <div className="relative animate-enter">
          <div className="flex flex-wrap gap-2">
            <span className="chip bg-mint">100% free</span>
            <span className="chip bg-sun">No sign-up</span>
            <span className="chip bg-white">Ages 6 to 99</span>
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Typing practice that feels like a{" "}
            <span className="mt-2 inline-flex gap-1.5 align-middle">
              {"GAME".split("").map((char, index) => (
                <span
                  key={char}
                  className="inline-grid h-14 w-12 animate-drift place-items-center rounded-[14px] border-[3px] border-ink text-4xl text-ink shadow-pop sm:h-16 sm:w-14 md:h-20 md:w-16 md:text-5xl"
                  style={{
                    background: TITLE_COLORS[index],
                    ["--r" as string]: `${index % 2 ? 6 : -6}deg`,
                    animationDelay: `${index * -0.6}s`,
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg font-semibold text-mute">
            Smash combos, blast meteors and watch your typing speed climb. Short, colourful games that teach real touch typing.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/word-rush" className="btn bg-sun">
              ⚡ Play Word Rush
            </Link>
            <Link href="/meteor-defense" className="btn bg-grape text-white">
              ☄️ Play Meteor Defense
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="sticker rotate-2 p-5 shadow-pop-lg">
            <Keycaps />
          </div>
          <Sticker className="-left-6 -top-6 bg-bubble text-white" rotate={-12}>
            x3 COMBO!
          </Sticker>
          <Sticker className="-right-4 top-24 bg-mint" rotate={10} delay={-1.5}>
            +50
          </Sticker>
          <Sticker className="-bottom-6 left-10 bg-sky" rotate={-6} delay={-3}>
            72 WPM 🚀
          </Sticker>
          <span className="absolute -bottom-8 -right-6 animate-spin-slow text-5xl" aria-hidden="true">
            ✨
          </span>
        </div>
      </section>

      {/* Marquee */}
      <div className="-rotate-2 overflow-hidden border-y-[3px] border-ink bg-ink py-4" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10">
          {[...MARQUEE, ...MARQUEE].map((word, index) => (
            <span key={index} className="flex items-center gap-10 font-display text-3xl font-bold uppercase" style={{ color: TITLE_COLORS[index % TITLE_COLORS.length] }}>
              {word}
              <span className="text-white">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* Games */}
      <section id="games" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5">
        <SectionTitle kicker="🎮 Pick a game" title="Two games. Endless high scores." color="#ffc53d" />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Link href="/word-rush" className="group sticker relative overflow-hidden bg-sun p-7 shadow-pop-lg transition hover:-translate-y-1 hover:rotate-[-0.5deg]">
            <span className="absolute -right-6 -top-6 grid h-28 w-28 place-items-center rounded-full border-[3px] border-ink bg-white text-5xl transition group-hover:rotate-12">⚡</span>
            <span className="chip bg-white">Mode 01 · Speed sprint</span>
            <h3 className="mt-4 font-display text-5xl font-bold">Word Rush</h3>
            <p className="mt-3 max-w-sm font-semibold text-ink/80">
              Race the clock through real words. Stay clean to stack combos up to x4 and rack up bonus points.
            </p>
            <div className="mt-6 rounded-control border-[3px] border-ink bg-white p-4 font-mono text-xl font-bold" aria-hidden="true">
              <span className="text-mint">quick </span>
              <span className="text-mint">brown </span>
              <span className="text-ink">f</span>
              <span className="inline-block h-6 w-[3px] translate-y-1 animate-blink bg-bubble" />
              <span className="text-ink/30">ox jumps over</span>
              <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
                <div className="h-full w-2/3 bg-bubble" />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="chip bg-white">⏱ 15 · 30 · 60s</span>
              <span className="chip bg-white">🎯 3 levels</span>
              <span className="chip bg-white">🖐 Finger guide</span>
              <span className="ml-auto font-display text-lg font-bold transition group-hover:translate-x-1">Play →</span>
            </div>
          </Link>

          <Link
            href="/meteor-defense"
            className="group sticker relative overflow-hidden bg-space p-7 text-white shadow-pop-lg transition hover:-translate-y-1 hover:rotate-[0.5deg]"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.5px), radial-gradient(circle at 80% 0%, #7b5cff 0, transparent 55%)", backgroundSize: "28px 28px, 100% 100%" }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 w-48">
              {["orbit", "laser", "nova", "zap"].map((word, index) => (
                <span
                  key={word}
                  className="absolute animate-fall rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-sm font-bold text-ink"
                  style={{ left: `${(index * 27) % 80}%`, top: 0, animationDelay: `${index * -0.9}s`, background: TITLE_COLORS[index] }}
                >
                  {word}
                </span>
              ))}
            </div>
            <span className="chip bg-bubble text-white">Mode 02 · Space arcade</span>
            <h3 className="mt-4 font-display text-5xl font-bold">Meteor Defense</h3>
            <p className="mt-3 max-w-xs font-semibold text-white/80">
              Words rain down as meteors. Type them to fire lasers, survive the waves and beat the boss rocks.
            </p>
            <div className="relative mt-6 h-[110px]" aria-hidden="true">
              <div className="absolute inset-x-[-30%] bottom-[-160px] h-[220px] rounded-[50%] border-[3px] border-ink bg-mint" />
              <div className="absolute bottom-6 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[16px] border-b-[30px] border-x-transparent border-b-sun drop-shadow-[0_3px_0_#1d1b3a]" />
            </div>
            <div className="relative flex flex-wrap items-center gap-2">
              <span className="chip bg-white text-ink">🌊 Endless waves</span>
              <span className="chip bg-white text-ink">👾 Boss meteors</span>
              <span className="chip bg-white text-ink">💥 EMP blast</span>
              <span className="ml-auto font-display text-lg font-bold transition group-hover:translate-x-1">Launch →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Audience */}
      <section className="mx-auto w-full max-w-6xl px-5">
        <SectionTitle kicker="👋 Made for everyone" title="From first keys to 100 WPM" color="#22d3a0" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {audiences.map((item, index) => (
            <article key={item.title} className={`sticker p-6 ${item.bg}`} style={{ transform: `rotate(${(index - 1) * 1.2}deg)` }}>
              <span className="grid h-16 w-16 place-items-center rounded-full border-[3px] border-ink bg-white text-3xl shadow-pop-sm">{item.emoji}</span>
              <h3 className="mt-4 font-display text-2xl font-bold">{item.title}</h3>
              <p className="mt-2 font-semibold text-mute">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-5">
        <div className="sticker bg-white p-8 md:p-12">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">How it works</h2>
          <ol className="relative mt-10 grid gap-10 md:grid-cols-3">
            <span aria-hidden="true" className="absolute left-[16%] right-[16%] top-8 hidden border-t-[3px] border-dashed border-ink/30 md:block" />
            {flow.map((item, index) => (
              <li key={item.title} className="relative text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-[3px] border-ink font-display text-2xl font-bold shadow-pop" style={{ background: item.color }}>
                  {index + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-xs font-semibold text-mute">{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <AdSlot slot={site.ads.slots.inline} className="mx-auto w-full max-w-6xl px-5" />

      {/* Guide */}
      <section id="guide" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5">
        <SectionTitle kicker="📚 Learn" title="Touch typing in five easy steps" color="#38b6ff" />
        <p className="mx-auto mt-4 max-w-2xl text-center font-semibold text-mute">
          Touch typing means typing without looking at the keys. It is the single biggest speed jump most people ever make.
        </p>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="sticker p-6">
              <span
                className="grid h-12 w-12 place-items-center rounded-[14px] border-[3px] border-ink font-display text-xl font-bold shadow-pop-sm"
                style={{ background: TITLE_COLORS[index % TITLE_COLORS.length], transform: `rotate(${index % 2 ? 6 : -6}deg)` }}
              >
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-2 font-semibold leading-7 text-mute">{step.copy}</p>
            </li>
          ))}
          <li className="sticker flex flex-col justify-between bg-bubble p-6 text-white">
            <p className="font-display text-2xl font-bold">Ready to try it?</p>
            <Link href="/word-rush" className="btn mt-6 self-start bg-white">
              Start practising →
            </Link>
          </li>
        </ol>
      </section>

      {/* Speed ladder */}
      <section className="mx-auto w-full max-w-6xl px-5">
        <SectionTitle kicker="🏆 Speed ranks" title="Which rank will you reach?" color="#ff8a3d" />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {RANKS.map((rank, index) => (
            <div
              key={rank.title}
              className="sticker p-4 text-center"
              style={{ background: RANK_COLORS[index], marginTop: `${(RANKS.length - 1 - index) * 10}px` }}
            >
              <p className="font-mono text-2xl font-bold">{rank.min}+</p>
              <p className="text-xs font-bold uppercase text-mute">wpm</p>
              <p className="mt-2 font-display text-lg font-bold leading-tight">{rank.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-3xl px-5">
        <SectionTitle kicker="❓ FAQ" title="Questions? Answers." color="#ff5fa2" />
        <div className="mt-10 grid gap-4">
          {faqs.map((item) => (
            <details key={item.q} className="group sticker p-5 open:bg-sun-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                {item.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-white font-mono text-lg transition group-open:rotate-45 group-open:bg-bubble">
                  +
                </span>
              </summary>
              <p className="mt-3 font-semibold leading-7 text-mute">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-5">
        <div className="sticker relative overflow-hidden bg-grape p-10 text-center text-white shadow-pop-lg md:p-14">
          <Blob className="-left-10 -top-10 h-48 w-48 bg-bubble/60" />
          <Blob className="-bottom-16 right-0 h-56 w-56 bg-sky/60" />
          <h2 className="relative font-display text-4xl font-bold md:text-6xl">Your fingers are ready.</h2>
          <p className="relative mx-auto mt-4 max-w-md text-lg font-semibold text-white/85">One quick round takes 30 seconds. Bet you play five.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/word-rush" className="btn bg-sun">
              ⚡ Word Rush
            </Link>
            <Link href="/meteor-defense" className="btn bg-white">
              ☄️ Meteor Defense
            </Link>
          </div>
        </div>
      </section>

      <AdSlot slot={site.ads.slots.footer} className="mx-auto w-full max-w-6xl px-5" />
    </main>
  );
}

function Blob({ className }: { className: string }) {
  return <span aria-hidden="true" className={`pointer-events-none absolute -z-0 rounded-full blur-3xl ${className}`} />;
}

function Sticker({ children, className, rotate, delay = 0 }: { children: React.ReactNode; className: string; rotate: number; delay?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-10 animate-drift rounded-full border-[3px] border-ink px-4 py-2 font-display text-lg font-bold shadow-pop ${className}`}
      style={{ ["--r" as string]: `${rotate}deg`, animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  );
}
