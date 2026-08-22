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
        { uri: `spotify:playlist:${playlist.id}`, width: "100%", height: "100%" },
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

  return (
    <div className="relative rounded-[1.75rem] overflow-hidden flex-1 min-h-[130px] shrink-0 border border-white/40 shadow-[0_8px_32px_-12px_rgba(88,60,180,0.22)]">
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute top-2.5 right-2.5 flex text-xs rounded-full p-1 gap-0.5 bg-black/35 backdrop-blur-md border border-white/15">
        <button
          onClick={() => onModeChange("ambient")}
          className={`rounded-full px-2.5 py-1 transition font-medium ${
            mode === "ambient" ? "btn-primary" : "text-white/80 hover:text-white"
          }`}
        >
          Ambient
        </button>
        <button
          onClick={() => onModeChange("40hz")}
          className={`rounded-full px-2.5 py-1 transition font-medium ${
            mode === "40hz" ? "btn-primary" : "text-white/80 hover:text-white"
          }`}
        >
          40Hz
        </button>
      </div>

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
  );
}
