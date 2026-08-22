"use client";

import { useEffect, useRef, useState } from "react";

const HOLD_MS = 5000;

async function api(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "request failed");
  return body;
}

export default function YoutubeBypassButton({ settings, onSettingsChange }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const bypassUntil = settings?.youtube_bypass_until
    ? new Date(settings.youtube_bypass_until)
    : null;
  const bypassActive = bypassUntil && bypassUntil > new Date();

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!bypassActive) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [bypassActive]);

  const tick = () => {
    const elapsed = performance.now() - startRef.current;
    const pct = Math.min(1, elapsed / HOLD_MS);
    setProgress(pct);
    if (pct >= 1) {
      complete();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (bypassActive) return;
    setHolding(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    setHolding(false);
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const complete = async () => {
    cancel();
    const { settings: updated } = await api("/api/youtube-bypass", { method: "POST" });
    onSettingsChange(updated);
  };

  const endEarly = async () => {
    const { settings: updated } = await api("/api/youtube-bypass", { method: "DELETE" });
    onSettingsChange(updated);
  };

  if (bypassActive) {
    const minsLeft = Math.max(0, Math.round((bypassUntil - now) / 60000));
    return (
      <div className="chip rounded-full px-4 py-2 flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-mint-500 flex-shrink-0" />
        <span className="text-ink-700">YouTube unlocked — {minsLeft}m left</span>
        <button onClick={endEarly} className="text-ink-400 hover:text-coral-500 text-xs underline">
          end now
        </button>
      </div>
    );
  }

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className="relative chip rounded-full px-4 py-2 text-sm text-ink-500 hover:text-ink-900 overflow-hidden select-none"
    >
      <span
        className="absolute inset-0 bg-mint-100 origin-left transition-transform"
        style={{ transform: `scaleX(${progress})`, transitionDuration: holding ? "0ms" : "150ms" }}
      />
      <span className="relative">
        {holding ? "keep holding…" : "hold 5s to unlock YouTube (study only)"}
      </span>
    </button>
  );
}
