import Link from "next/link";
import { SoundToggle } from "@/components/sound-toggle";
import { site } from "@/lib/site";

const LOGO = [
  { char: "T", color: "#ff5fa2" },
  { char: "P", color: "#ffc53d" },
];

// "Ty" + "play": the wordmark highlights the play half of the name.
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
      <span className="flex -space-x-1">
        {LOGO.map((key, index) => (
          <span
            key={key.char}
            className="grid h-8 w-8 place-items-center rounded-[9px] border-[2.5px] border-ink text-base text-ink shadow-pop-sm"
            style={{ background: key.color, transform: `rotate(${index ? 8 : -8}deg)` }}
          >
            {key.char}
          </span>
        ))}
      </span>
      <span className={inverted ? "text-white" : "text-ink"}>
        Ty<span className="text-bubble">play</span>
      </span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo />
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link href="/word-rush" className="hidden rounded-full px-3 py-2 hover:bg-sun-soft md:inline">
            ⚡ Word Rush
          </Link>
          <Link href="/meteor-defense" className="hidden rounded-full px-3 py-2 hover:bg-grape-soft md:inline">
            ☄️ Meteor Defense
          </Link>
          <Link href="/#guide" className="hidden rounded-full px-3 py-2 hover:bg-mint-soft lg:inline">
            Learn
          </Link>
          <SoundToggle />
          <Link href="/word-rush" className="btn whitespace-nowrap bg-bubble px-4 py-1.5 text-base text-white">
            Play<span className="hidden sm:inline"> free</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
