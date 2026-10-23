import type { Metadata, Viewport } from "next";
import { Fredoka, JetBrains_Mono, Nunito } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["typing games", "typing test", "learn touch typing", "WPM test", "free typing practice", "keyboard games", "typing speed"],
  authors: [{ name: site.creator }],
  creator: site.creator,
  publisher: site.creator,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  ...(site.ads.client ? { other: { "google-adsense-account": site.ads.client } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#fff8ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col overflow-x-hidden font-sans antialiased">
        {site.ads.client ? (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.ads.client}`}
          />
        ) : null}
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
