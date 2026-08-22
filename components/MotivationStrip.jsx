"use client";

import { useMemo } from "react";
import { getRandomQuote } from "@/lib/quotes";

export default function MotivationStrip() {
  // A fresh random pick from a pool of 600+ generated lines each time you
  // load the dashboard — see lib/quotes.js.
  const quote = useMemo(() => getRandomQuote(), []);

  return (
    <div className="card p-6 justify-center bg-gradient-to-br from-violet-100 via-white to-coral-100">
      <p className="font-display font-medium text-ink-900 text-lg leading-snug">"{quote}"</p>
    </div>
  );
}
