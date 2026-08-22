"use client";

import Link from "next/link";
import { useState } from "react";

export default function CrashMode({ open, onClose, onStartBeats }) {
  const [branch, setBranch] = useState(null); // "tired" | "lost" | null

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="card w-full max-w-md p-8 text-center">
        {!branch && (
          <>
            <h2 className="font-display font-bold text-2xl text-ink-900 mb-2">Okay. Let's reset.</h2>
            <p className="text-ink-500 text-sm mb-6">What's actually going on right now?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setBranch("tired")}
                className="rounded-xl chip px-5 py-4 text-left hover:bg-violet-100 hover:border-violet-400 transition"
              >
                <div className="text-ink-900 font-display font-semibold">I'm tired</div>
                <div className="text-ink-500 text-xs mt-1">
                  My body needs rest, not more willpower.
                </div>
              </button>
              <button
                onClick={() => setBranch("lost")}
                className="rounded-xl chip px-5 py-4 text-left hover:bg-coral-100 hover:border-coral-400 transition"
              >
                <div className="text-ink-900 font-display font-semibold">I don't know what to do</div>
                <div className="text-ink-500 text-xs mt-1">
                  I have energy, just no clear next step.
                </div>
              </button>
            </div>
            <button onClick={onClose} className="mt-6 text-ink-400 text-xs hover:text-ink-700">
              never mind, close
            </button>
          </>
        )}

        {branch === "tired" && (
          <>
            <h2 className="font-display font-bold text-2xl text-ink-900 mb-2">Go to bed.</h2>
            <p className="text-ink-500 text-sm mb-6">
              Pushing through tired doesn't make you focused, it makes tomorrow
              worse too. Wind down now — dim the lights, put the phone down,
              and protect tomorrow's version of you.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/settings#sleep"
                className="rounded-full bg-violet-500 hover:bg-violet-600 text-white font-display font-semibold px-5 py-3 transition"
              >
                Open sleep / bedtime
              </Link>
              <button onClick={onClose} className="text-ink-400 text-xs hover:text-ink-700">
                close
              </button>
            </div>
          </>
        )}

        {branch === "lost" && (
          <>
            <h2 className="font-display font-bold text-2xl text-ink-900 mb-2">Pick one thing.</h2>
            <p className="text-ink-500 text-sm mb-6">
              Starting 40Hz focus audio and picking your single top task —
              not the whole list, just the next one.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onStartBeats}
                className="btn-primary rounded-full font-display font-semibold px-5 py-3"
              >
                Start 40Hz beats + show my next task
              </button>
              <button onClick={onClose} className="text-ink-400 text-xs hover:text-ink-700">
                close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
