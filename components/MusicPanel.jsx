"use client";

import { useState } from "react";

// Curated YouTube playlist/video IDs. Swap these for whatever you actually
// like listening to — see README "Customizing the music panel".
const TRACKS = {
  ambient: [
    { id: "jfKfPfyJRdk", label: "lofi hip hop radio" },
    { id: "4xDzrJKXOOY", label: "synthwave / deep focus" },
    { id: "DWcJFNfaw9c", label: "ambient study — rain + piano" },
  ],
  "40hz": [
    { id: "vjmyxAxxeGc", label: "40Hz binaural beats — focus" },
    { id: "V4OXwSTgHXk", label: "40Hz gamma tone — deep concentration" },
  ],
};

export default function MusicPanel({ mode, onModeChange }) {
  const list = TRACKS[mode];
  const [activeId, setActiveId] = useState(list[0].id);
  const active = list.find((t) => t.id === activeId) || list[0];

  const switchMode = (next) => {
    onModeChange(next);
    setActiveId(TRACKS[next][0].id);
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

      <div className="rounded-xl overflow-hidden bg-paper-200 mb-3">
        <iframe
          key={active.id}
          className="w-full aspect-video"
          src={`https://www.youtube-nocookie.com/embed/${active.id}?rel=0&autoplay=0`}
          title={active.label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {list.map((track) => (
          <button
            key={track.id}
            onClick={() => setActiveId(track.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              track.id === activeId
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
