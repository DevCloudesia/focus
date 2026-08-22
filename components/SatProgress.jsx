"use client";

import { useEffect, useState } from "react";

export default function SatProgress() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/sat-progress")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ connected: false }));
  }, []);

  if (!data || !data.connected) {
    return (
      <a
        href="https://daily-fifty.vercel.app/"
        target="_blank"
        rel="noreferrer"
        className="chip rounded-full px-4 py-2 text-sm text-ink-500 hover:text-ink-900 transition font-medium"
      >
        SAT prep ↗
      </a>
    );
  }

  const { completed_count = 0, total_planned = 50 } = data;

  return (
    <a
      href="https://daily-fifty.vercel.app/"
      target="_blank"
      rel="noreferrer"
      className="chip rounded-full px-4 py-2 text-sm text-ink-700 hover:bg-paper-200 transition font-medium"
    >
      SAT today <span className="text-coral-600 font-semibold">{completed_count}</span>
      <span className="text-ink-400">/{total_planned || 50}</span>
    </a>
  );
}
