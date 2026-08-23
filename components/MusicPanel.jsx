"use client";

import { useEffect, useRef, useState } from "react";

// Real Spotify playlists, one array per mode — used as a fallback whenever
// TRACKS below is empty for that mode. Add more IDs here as you find good
// ones (right-click a playlist in Spotify → Share → Copy link, take the ID
// after /playlist/).
const PLAYLISTS = {
  ambient: [{ id: "37i9dQZF1DWZeKCadgRdKQ", label: "Deep Focus" }],
  "40hz": [{ id: "2xpWaAj5jzRFBnlaSAORnf", label: "40Hz Focus" }],
};

// Spotify's playlist embed always plays in the playlist's own saved order —
// there's no API to shuffle it from code. The real fix is to control
// playback one track at a time: list the individual songs you want here
// (right-click a track → Share → Copy Song Link, take the ID after
// /track/) and this panel will shuffle them itself and auto-advance,
// reshuffling into a new order every time it loops. Leave a mode's array
// empty to fall back to the playlist embed above for that mode.
const TRACKS = {
  ambient: [],
  "40hz": [],
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

// Fisher-Yates — a fresh random order each time the queue is (re)built,
// not just a fixed set of pre-shuffled orders.
function shuffled(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const MODE_LABEL = { ambient: "Focus Mix", "40hz": "40Hz Mix" };

// Spotify's compact bar kicks in below this — never ask for less.
const MIN_PLAYER_HEIGHT = 152;

export default function MusicPanel({ mode, onModeChange }) {
  const boxRef = useRef(null);
  const mountRef = useRef(null);
  const controllerRef = useRef(null);
  const queueRef = useRef([]);
  const queueIndexRef = useRef(0);
  const lastPositionRef = useRef(0);
  const modeRef = useRef(mode);
  const usingTrackQueue = TRACKS[mode]?.length > 0;

  const [playlist, setPlaylist] = useState(() => pickRandom(PLAYLISTS[mode]));
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // New random playlist (or a freshly shuffled track queue) each time mode
  // changes. modeRef stays current so the playback_update listener below —
  // registered once on mount — always reads the live mode instead of the
  // one captured when it was created.
  useEffect(() => {
    modeRef.current = mode;
    setPlaylist(pickRandom(PLAYLISTS[mode]));
    if (TRACKS[mode]?.length > 0) {
      queueRef.current = shuffled(TRACKS[mode]);
      queueIndexRef.current = 0;
    }
  }, [mode]);

  const currentUri = () =>
    usingTrackQueue
      ? `spotify:track:${queueRef.current[queueIndexRef.current]}`
      : `spotify:playlist:${playlist.id}`;

  // Build the controller exactly once, on mount. Spotify's createController
  // only accepts a fixed pixel height as a *seed* — but the iframe it
  // creates underneath is a normal DOM element, so right after creation we
  // override its inline width/height to 100%, letting it fill this box via
  // plain CSS from then on. That means any later layout shift (Messages
  // above it collapsing on a Gmail dismiss, a viewport resize, whatever)
  // just resizes the box — no rebuild, no reload, no interrupted playback.
  useEffect(() => {
    if (!mountRef.current) return;
    let cancelled = false;
    const seedHeight = Math.max(boxRef.current?.clientHeight || 0, MIN_PLAYER_HEIGHT);

    if (usingTrackQueue && queueRef.current.length === 0) {
      queueRef.current = shuffled(TRACKS[mode]);
    }

    loadSpotifyIframeApi().then((IFrameAPI) => {
      if (cancelled || !mountRef.current) return;
      IFrameAPI.createController(
        mountRef.current,
        { uri: currentUri(), width: "100%", height: seedHeight },
        (controller) => {
          if (cancelled) return;
          controllerRef.current = controller;
          const iframe = mountRef.current.querySelector("iframe");
          if (iframe) {
            iframe.style.width = "100%";
            iframe.style.height = "100%";
          }
          setReady(true);
          controller.addListener("playback_update", (e) => {
            setPlaying(!e.data.isPaused);

            // The iFrame API has no explicit "track ended" event, so this
            // infers it: playback stops (isPaused) with position reset
            // back to the start — a real pause from the listener leaves
            // position where they stopped, not at 0. Only matters in
            // track-queue mode; the playlist embed advances on its own.
            const liveTracks = TRACKS[modeRef.current];
            if (liveTracks?.length > 0) {
              if (e.data.isPaused && e.data.position === 0 && lastPositionRef.current > 1000) {
                queueIndexRef.current += 1;
                if (queueIndexRef.current >= queueRef.current.length) {
                  queueRef.current = shuffled(liveTracks);
                  queueIndexRef.current = 0;
                }
                controller.loadUri(`spotify:track:${queueRef.current[queueIndexRef.current]}`);
                setTimeout(() => controller.play(), 300);
              }
              lastPositionRef.current = e.data.position;
            }
          });
        }
      );
    });

    return () => {
      cancelled = true;
      controllerRef.current?.destroy?.();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- build once; track/mode changes handled below, never rebuild on resize
  }, []);

  // Swap tracks/playlist on an existing controller instead of rebuilding it.
  useEffect(() => {
    if (!ready || !controllerRef.current) return;
    controllerRef.current.loadUri(currentUri());
    if (playing) {
      setTimeout(() => controllerRef.current?.play(), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the mode/track selection actually changes
  }, [mode, playlist.id]);

  const start = () => {
    setPlaying(true);
    controllerRef.current?.play();
  };

  const label = usingTrackQueue ? MODE_LABEL[mode] : playlist.label;

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      {/* Mode toggle lives above the player, not on top of it — Spotify's
          own embed already uses its corners for its own controls (like,
          more, external link), so overlaying there collides with them. */}
      <div className="shrink-0 flex justify-end">
        <div className="chip rounded-full p-1 flex text-xs gap-0.5">
          <button
            onClick={() => onModeChange("ambient")}
            className={`rounded-full px-2.5 py-1 transition font-medium ${
              mode === "ambient" ? "btn-primary" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            Ambient
          </button>
          <button
            onClick={() => onModeChange("40hz")}
            className={`rounded-full px-2.5 py-1 transition font-medium ${
              mode === "40hz" ? "btn-primary" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            40Hz
          </button>
        </div>
      </div>

      <div
        ref={boxRef}
        className="relative rounded-[1.75rem] overflow-hidden flex-1 min-h-[152px] border border-white/40 shadow-[0_8px_32px_-12px_rgba(88,60,180,0.22)]"
      >
        <div ref={mountRef} className="absolute inset-0" />

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
            Start {label}
          </button>
        )}
      </div>
    </div>
  );
}
