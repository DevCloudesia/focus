"use client";

import { useEffect, useState } from "react";
import { getTimeBand } from "@/lib/timeBand";

// The header mark: a simple sun (dawn/day/dusk) or crescent moon (night)
// drawn in the current accent color, so it's always "on brand" without a
// static logo file. Computed client-side to avoid an SSR/local-time mismatch.
export default function TimeMark({ className = "w-6 h-6" }) {
  const [band, setBand] = useState(null);

  useEffect(() => {
    setBand(getTimeBand());
  }, []);

  if (!band) return <span className={className} aria-hidden />;

  if (band === "night") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <path
          d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
          fill="var(--accent-a)"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="5" fill="var(--accent-a)" />
      <g stroke="var(--accent-a)" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1.5" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="22.5" y2="12" />
        <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
        <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
        <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
        <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
      </g>
    </svg>
  );
}
