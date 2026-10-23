export const site = {
  name: "Typlay",
  slogan: "Type. Play. Level up.",
  tagline: "Free typing games that make you faster",
  description:
    "Learn touch typing by playing. Free arcade typing games — Word Rush and Meteor Defense — with combos, live WPM and finger guides. No sign-up.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3080",
  creator: "Letterena",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  ads: {
    // Google AdSense publisher id, e.g. "ca-pub-1234567890123456". Ads stay off until it is set.
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
    slots: {
      inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE ?? "",
      footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? "",
    },
  },
};

export const games = [
  {
    slug: "word-rush",
    name: "Word Rush",
    short: "Sprint through real words against the clock. Clean words build combos and multiply your score.",
  },
  {
    slug: "meteor-defense",
    name: "Meteor Defense",
    short: "Words fall as meteors. Type them to fire lasers, survive the waves and protect your planet.",
  },
] as const;
