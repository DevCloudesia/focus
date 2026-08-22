"use client";

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
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-mist-100">Sound</h3>
        <div className="chip rounded-full p-1 flex text-xs">
          <button
            onClick={() => onModeChange("ambient")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "ambient" ? "bg-white/10 text-mist-100" : "text-mist-400"
            }`}
          >
            Ambient
          </button>
          <button
            onClick={() => onModeChange("40hz")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "40hz" ? "bg-white/10 text-mist-100" : "text-mist-400"
            }`}
          >
            40Hz focus
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {list.map((track) => (
          <div key={track.id} className="rounded-xl overflow-hidden bg-black/30">
            <iframe
              className="w-full aspect-video"
              src={`https://www.youtube-nocookie.com/embed/${track.id}?rel=0`}
              title={track.label}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="px-3 py-2 text-xs text-mist-400">{track.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
