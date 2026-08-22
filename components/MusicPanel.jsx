"use client";

import { useEffect, useRef, useState } from "react";

// Real Spotify playlists, one array per mode so a random one plays each
// time you switch modes — add more IDs here as you find good ones
// (right-click a playlist in Spotify → Share → Copy link, take the ID
// after /playlist/).
const PLAYLISTS = {
  ambient: [{ id: "37i9dQZF1DWZeKCadgRdKQ", label: "Deep Focus" }],
  "40hz": [{ id: "2xpWaAj5jzRFBnlaSAORnf", label: "40Hz Focus" }],
};

// Browsers block real autoplay without a genuine user gesture, and Spotify's
// `?autoplay=1` query param alone doesn't reliably get past that. The
// iFrame Playback API's `.play()` — called from inside a click handler —
// is a real user gesture, so it's the one approach that reliably starts
// audio. Loaded once and cached on `window`.
let apiPromise = null;
function loadSpotifyIframeApi() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => resolve(IFrameAPI);
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
  });
  return apiPromise;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function MusicPanel({ mode, onModeChange }) {
  const mountRef = useRef(null);
  const controllerRef = useRef(null);
  const [playlist, setPlaylist] = useState(() => pickRandom(PLAYLISTS[mode]));
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // New random playlist from the mode's pool each time mode changes.
  useEffect(() => {
    setPlaylist(pickRandom(PLAYLISTS[mode]));
  }, [mode]);

  // Create the controller once.
  useEffect(() => {
    let cancelled = false;
    loadSpotifyIframeApi().then((IFrameAPI) => {
      if (cancelled || !IFrameAPI || !mountRef.current) return;
      IFrameAPI.createController(
        mountRef.current,
        { uri: `spotify:playlist:${playlist.id}`, width: "100%", height: "152" },
        (controller) => {
          if (cancelled) return;
          controllerRef.current = controller;
          setReady(true);
          controller.addListener("playback_update", (e) => {
            setPlaying(!e.data.isPaused);
          });
        }
      );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- controller created once
  }, []);

  // Swap tracks on an existing controller instead of re-mounting the iframe.
  useEffect(() => {
    if (!ready || !controllerRef.current) return;
    controllerRef.current.loadUri(`spotify:playlist:${playlist.id}`);
    if (playing) {
      setTimeout(() => controllerRef.current?.play(), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on track change
  }, [playlist.id]);

  const start = () => {
    setPlaying(true);
    controllerRef.current?.play();
  };

  const pause = () => {
    setPlaying(false);
    controllerRef.current?.pause();
  };

  return (
    <div className="card card-auto p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-base text-ink-900">Sound</h3>
        <div className="chip rounded-full p-1 flex text-xs">
          <button
            onClick={() => onModeChange("ambient")}
            className={`rounded-full px-3 py-1.5 transition font-medium ${
              mode === "ambient" ? "btn-primary" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            Ambient
          </button>
          <button
            onClick={() => onModeChange("40hz")}
            className={`rounded-full px-3 py-1.5 transition font-medium ${
              mode === "40hz" ? "btn-primary" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            40Hz Focus
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden">
        <div ref={mountRef} />
        {ready && !playing && (
          <button
            onClick={start}
            className="absolute inset-0 flex items-center justify-center bg-ink-900/45 backdrop-blur-sm text-white font-display font-semibold gap-2 transition hover:bg-ink-900/55"
          >
            <span className="w-11 h-11 rounded-full btn-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Start {playlist.label}
          </button>
        )}
      </div>

      {ready && playing && (
        <button
          onClick={pause}
          className="text-ink-400 hover:text-ink-700 text-xs mt-2 underline"
        >
          Pause
        </button>
      )}
      <p className="text-ink-400 text-xs mt-2">
        Needs you logged into Spotify in this browser (free accounts get occasional ads).
      </p>
    </div>
  );
}
