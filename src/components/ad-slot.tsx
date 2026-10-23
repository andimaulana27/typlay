"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Keep ads away from game controls (AdSense policy on accidental clicks): only place this between content blocks.
export function AdSlot({ slot, className }: { slot: string; className?: string }) {
  const pushed = useRef(false);
  const client = site.ads.client;

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers throw here; the page works without ads.
    }
  }, [client, slot]);

  if (!client || !slot) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div className={cn("grid h-24 place-items-center rounded-card border-[3px] border-dashed border-ink/30 bg-white/60 text-sm font-bold text-mute", className)}>
        ad slot · set NEXT_PUBLIC_ADSENSE_CLIENT
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-card bg-white/70 p-2", className)}>
      <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-mute/70">Advertisement</p>
      <ins
        className="adsbygoogle block"
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
