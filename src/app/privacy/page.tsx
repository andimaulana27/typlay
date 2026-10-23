import type { Metadata } from "next";
import { ContactLine, ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles your data, cookies and advertising.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy Policy" updated="October 23, 2026">
      <p>
        This policy explains what information {site.name} ({site.url}) collects and how it is used. You can play every game without creating
        an account.
      </p>

      <h2>Information stored on your device</h2>
      <p>
        Your personal best scores and your sound preference are saved in your browser&apos;s local storage. This data never leaves your
        device and you can delete it at any time by clearing site data in your browser.
      </p>

      <h2>Advertising</h2>
      <p>
        We use Google AdSense to show ads. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this
        and other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visits to
        this site and/or other sites on the internet.
      </p>
      <ul>
        <li>
          You may opt out of personalised advertising by visiting <a href="https://adssettings.google.com">Google Ads Settings</a>.
        </li>
        <li>
          You can opt out of some third-party vendors&apos; use of cookies for personalised advertising at{" "}
          <a href="https://www.aboutads.info/choices/">www.aboutads.info</a>.
        </li>
        <li>
          Learn how Google uses data from sites that use its services at{" "}
          <a href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</a>.
        </li>
      </ul>
      <p>
        Visitors from the European Economic Area, the United Kingdom and Switzerland are asked for consent before personalised ads or
        non-essential cookies are used. You can change your choice at any time through the privacy message link on the page.
      </p>

      <h2>Server logs</h2>
      <p>
        Like most websites, our hosting provider may record standard technical information such as IP address, browser type and the pages
        requested. This is used only to keep the site secure and running.
      </p>

      <h2>Children</h2>
      <p>
        {site.name} is suitable for all ages, but it is not directed at children under 13 and we do not knowingly collect personal
        information from them.
      </p>

      <h2>Changes</h2>
      <p>We may update this policy from time to time. The date at the top shows when it last changed.</p>
      <ContactLine />
    </ProsePage>
  );
}
