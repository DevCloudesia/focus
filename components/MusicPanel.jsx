"use client";

import { useEffect, useRef, useState } from "react";

// Synthesized locally (see public/audio + the generation script) — no
// YouTube dependency, nothing that can go offline or region-lock. Ambient
// tracks are generated drone/noise, not licensed music (rehosting real
// copyrighted tracks isn't something we can do here) — swap in your own
// files under public/audio/ if you want actual songs; any browser-playable
// format works, just update TRACKS below.
const TRACKS = {
  ambient: [
    { src: "/audio/warm-drone.wav", label: "Warm drone" },
    { src: "/audio/soft-rain.wav", label: "Soft rain" },
    { src: "/audio/pad-plus-rain.wav", label: "Pad + rain" },
  ],
  "40hz": [
    { src: "/audio/40hz-binaural.wav", label: "40Hz binaural beat" },
    { src: "/audio/40hz-isochronic.wav", label: "40Hz isochronic pulse" },
  ],
};

export default function MusicPanel({ mode, onModeChange, autoPlaySignal }) {
  const list = TRACKS[mode];
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const active = list[activeIdx] || list[0];

  // Bumped by crash mode's "start 40Hz beats" button, from outside this
  // component's own state — auto-starts playback rather than just
  // switching tabs and leaving it paused.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setActiveIdx(0);
    setPlaying(true);
  }, [autoPlaySignal]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => setPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [playing, active]);

  const switchMode = (next) => {
    onModeChange(next);
    setActiveIdx(0);
    setPlaying(false);
  };

  const pickTrack = (idx) => {
    setActiveIdx(idx);
    setPlaying(true);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-ink-900">Sound</h3>
        <div className="chip rounded-full p-1 flex text-xs">
          <button
            onClick={() => switchMode("ambient")}
            className={`rounded-full px-3 py-1.5 transition font-medium ${
              mode === "ambient" ? "bg-violet-500 text-white" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            Ambient
          </button>
          <button
            onClick={() => switchMode("40hz")}
            className={`rounded-full px-3 py-1.5 transition font-medium ${
              mode === "40hz" ? "bg-coral-500 text-white" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            40Hz focus
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={active.src} loop preload="none" />

      <div className="rounded-xl bg-paper-200 p-5 mb-3 flex items-center gap-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-12 h-12 rounded-full bg-ink-900 hover:bg-ink-700 text-white flex items-center justify-center flex-shrink-0 transition"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current ml-0.5">
              <path d="M7 5v14l12-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-ink-900 truncate">{active.label}</div>
          <div className="text-xs text-ink-500">{playing ? "playing, loops" : "paused"}</div>
        </div>

        <button
          onClick={() => setMuted((m) => !m)}
          className="text-ink-500 hover:text-ink-900 flex-shrink-0"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M16.5 12A4.5 4.5 0 0014 8v1.79l2.48 2.48c.01-.09.02-.18.02-.27zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L18.73 21 20 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8v8a4.5 4.5 0 002.5-4zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(e) => {
            setMuted(false);
            setVolume(Number(e.target.value));
          }}
          className="w-20 accent-violet-500"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {list.map((track, idx) => (
          <button
            key={track.src}
            onClick={() => pickTrack(idx)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              idx === activeIdx
                ? "bg-ink-900 text-white"
                : "chip text-ink-500 hover:text-ink-900"
            }`}
          >
            {track.label}
          </button>
        ))}
      </div>
    </div>
  );
}
