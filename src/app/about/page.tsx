import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${site.name} exists and who makes it.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ProsePage title={`About ${site.name}`}>
      <p>
        {site.name} is a free collection of typing games made by {site.creator}. We believe learning to touch type should feel like
        playing an arcade game, not filling in a worksheet.
      </p>
      <p>
        Every game runs in your browser with no account and no download. Rounds are short, feedback is instant, and the finger guide shows
        you exactly how to reach each key — so you build real muscle memory while chasing a high score.
      </p>
      <h2>The games</h2>
      <ul>
        <li>
          <Link href="/word-rush">Word Rush</Link> — a timed sprint that measures your words per minute and accuracy.
        </li>
        <li>
          <Link href="/meteor-defense">Meteor Defense</Link> — a wave-based shooter where typing words is your only weapon.
        </li>
      </ul>
      <h2>How we keep it free</h2>
      <p>
        {site.name} is funded by advertising. We keep ads away from the game area so they never get in the way of play. See our{" "}
        <Link href="/privacy">privacy policy</Link> for how ads use cookies.
      </p>
      <ContactLine />
    </ProsePage>
  );
}
