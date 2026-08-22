"use client";

import Link from "next/link";
import { useState } from "react";

export default function CrashMode({ open, onClose, onStartBeats }) {
  const [branch, setBranch] = useState(null); // "tired" | "lost" | null

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="card w-full max-w-md p-8 text-center">
        {!branch && (
          <>
            <h2 className="font-display text-2xl text-mist-100 mb-2">Okay. Let's reset.</h2>
            <p className="text-mist-400 text-sm mb-6">What's actually going on right now?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setBranch("tired")}
                className="rounded-xl chip px-5 py-4 text-left hover:bg-white/5 transition"
              >
                <div className="text-mist-100 font-medium">I'm tired</div>
                <div className="text-mist-400 text-xs mt-1">
                  My body needs rest, not more willpower.
                </div>
              </button>
              <button
                onClick={() => setBranch("lost")}
                className="rounded-xl chip px-5 py-4 text-left hover:bg-white/5 transition"
              >
                <div className="text-mist-100 font-medium">I don't know what to do</div>
                <div className="text-mist-400 text-xs mt-1">
                  I have energy, just no clear next step.
                </div>
              </button>
            </div>
            <button onClick={onClose} className="mt-6 text-mist-500 text-xs hover:text-mist-300">
              never mind, close
            </button>
          </>
        )}

        {branch === "tired" && (
          <>
            <h2 className="font-display text-2xl text-mist-100 mb-2">Go to bed.</h2>
            <p className="text-mist-400 text-sm mb-6">
              Pushing through tired doesn't make you focused, it makes tomorrow
              worse too. Wind down now — dim the lights, put the phone down,
              and protect tomorrow's version of you.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/settings#sleep"
                className="rounded-full bg-dusk-500 hover:bg-dusk-400 text-ink-950 font-semibold px-5 py-3 transition"
              >
                Open sleep / bedtime
              </Link>
              <button onClick={onClose} className="text-mist-500 text-xs hover:text-mist-300">
                close
              </button>
            </div>
          </>
        )}

        {branch === "lost" && (
          <>
            <h2 className="font-display text-2xl text-mist-100 mb-2">Pick one thing.</h2>
            <p className="text-mist-400 text-sm mb-6">
              Starting 40Hz focus audio and picking your single top task —
              not the whole list, just the next one.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onStartBeats}
                className="rounded-full bg-ember-500 hover:bg-ember-400 text-ink-950 font-semibold px-5 py-3 transition"
              >
                Start 40Hz beats + show my next task
              </button>
              <button onClick={onClose} className="text-mist-500 text-xs hover:text-mist-300">
                close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
