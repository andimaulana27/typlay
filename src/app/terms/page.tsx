import type { Metadata } from "next";
import { ContactLine, ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The rules for using ${site.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Use" updated="October 23, 2026">
      <p>By using {site.name} you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>Free to use</h2>
      <p>
        The games are provided free of charge for personal, non-commercial use. You may share links to the site and screenshots of your
        scores.
      </p>
      <h2>Fair play</h2>
      <p>Do not attempt to disrupt the site, scrape it at scale, or interfere with the advertising that keeps it free.</p>
      <h2>No warranty</h2>
      <p>
        {site.name} is provided &quot;as is&quot; without warranties of any kind. Typing speed results are for practice and entertainment
        and are not a certified assessment.
      </p>
      <h2>Content</h2>
      <p>
        All game design, code and artwork belong to {site.creator}. Third-party ads are the responsibility of their advertisers.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use of the site after changes means you accept them.</p>
      <ContactLine />
    </ProsePage>
  );
}
