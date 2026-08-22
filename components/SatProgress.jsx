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
        className="chip rounded-full px-4 py-2 text-sm text-mist-400 hover:text-mist-200 transition"
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
      className="chip rounded-full px-4 py-2 text-sm text-mist-300 hover:text-mist-100 transition"
    >
      SAT today: <span className="text-ember-400 font-semibold">{completed_count}</span>/
      {total_planned || 50}
    </a>
  );
}
