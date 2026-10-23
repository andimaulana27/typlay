"use client";

import { useSyncExternalStore } from "react";
import { isMuted, setMuted, subscribeMuted } from "@/lib/sfx";

export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  return (
    <button
      type="button"
      onClick={(event) => {
        setMuted(!muted);
        event.currentTarget.blur();
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className="grid h-10 w-10 place-items-center rounded-full border-[2.5px] border-ink bg-white shadow-pop-sm transition hover:-translate-y-0.5"
      style={{ background: muted ? "#ffffff" : "#d5f8ec" }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
        {muted ? <path d="m22 9-6 6m0-6 6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}
      </svg>
    </button>
  );
}
