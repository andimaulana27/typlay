import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function config(phase: string): NextConfig {
  const development = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    poweredByHeader: false,
    distDir: development ? ".next-dev" : ".next",
    allowedDevOrigins: ["127.0.0.1"],
    async redirects() {
      return [{ source: "/play", destination: "/word-rush", permanent: true }];
    },
  };
}
