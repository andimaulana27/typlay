import Link from "next/link";
import { Logo } from "@/components/site-header";
import { games, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-ink bg-ink text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="max-w-xs">
            <Logo inverted />
            <p className="mt-3 font-display text-lg font-semibold text-sun">{site.slogan}</p>
            <p className="mt-1 text-white/70">Free typing games for kids, students and grown-ups. Made with ♥ by {site.creator}.</p>
          </div>
          <div className="flex gap-14 text-sm">
            <ul className="grid gap-2">
              <li className="font-display text-base font-semibold text-sun">Play</li>
              {games.map((game) => (
                <li key={game.slug}>
                  <Link href={`/${game.slug}`} className="text-white/75 hover:text-white">
                    {game.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="grid gap-2">
              <li className="font-display text-base font-semibold text-bubble">Site</li>
              {[
                ["About", "/about"],
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href ?? "/"} className="text-white/75 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} {site.creator}. All rights reserved.
          </p>
          <p className="flex gap-1.5" aria-hidden="true">
            {["#ff5fa2", "#ffc53d", "#22d3a0", "#38b6ff", "#7b5cff"].map((color) => (
              <span key={color} className="h-3 w-3 rounded-full" style={{ background: color }} />
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
