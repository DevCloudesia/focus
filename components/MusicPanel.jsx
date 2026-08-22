"use client";

// Real Spotify playlists (paste your own links in Settings' README section
// or just edit these IDs directly — right-click a playlist → Share → Copy
// link, take the ID after /playlist/).
const PLAYLISTS = {
  ambient: { id: "37i9dQZF1DWZeKCadgRdKQ", label: "Deep Focus" },
  "40hz": { id: "2xpWaAj5jzRFBnlaSAORnf", label: "40Hz" },
};

export default function MusicPanel({ mode, onModeChange }) {
  const playlist = PLAYLISTS[mode];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-ink-900">Sound</h3>
        <div className="chip rounded-full p-1 flex text-xs">
          <button
            onClick={() => onModeChange("ambient")}
            className={`rounded-full px-3 py-1.5 transition font-medium ${
              mode === "ambient" ? "bg-violet-500 text-white" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            Ambient
          </button>
          <button
            onClick={() => onModeChange("40hz")}
            className={`rounded-full px-3 py-1.5 transition font-medium ${
              mode === "40hz" ? "bg-coral-500 text-white" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            40Hz Focus
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden">
        <iframe
          key={playlist.id}
          title={playlist.label}
          src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&autoplay=1`}
          width="100%"
          height="352"
          style={{ border: 0 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
      <p className="text-ink-400 text-xs mt-2">
        Needs you logged into Spotify in this browser to actually play (free accounts get
        occasional ads) — and most browsers still require one click before audio starts, even
        with autoplay requested.
      </p>
    </div>
  );
}
