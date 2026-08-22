"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSessionPhase,
  minutesSince,
  formatClock,
  PROMPT_AT_MIN,
  DECISION_DEADLINE_MIN,
  EXTENDED_LENGTH_MIN,
} from "@/lib/sessionEngine";

const PHASE_COPY = {
  working: { label: "Deep work", tone: "text-mist-200" },
  awaiting_confirm: { label: "Done, or keep going?", tone: "text-ember-400" },
  extended: { label: "Extended session", tone: "text-dusk-400" },
  extended_complete: { label: "Time's up", tone: "text-ember-500" },
};

export default function FocusTimer({
  session,
  weekend,
  defaultType,
  onStart,
  onConfirmDone,
  onForceEnd,
  onAbandon,
  onCrash,
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = session ? getSessionPhase(session, now) : "idle";

  useEffect(() => {
    if (phase === "extended_complete") {
      onForceEnd();
    }
  }, [phase, onForceEnd]);

  const elapsedMin = session ? minutesSince(session.started_at, now) : 0;
  const targetMin = phase === "extended" ? EXTENDED_LENGTH_MIN : DECISION_DEADLINE_MIN;
  const remainingSec = Math.max(0, targetMin * 60 - elapsedMin * 60);

  const progressPct = useMemo(() => {
    if (!session) return 0;
    const cap = phase === "extended" ? EXTENDED_LENGTH_MIN : PROMPT_AT_MIN;
    return Math.min(100, (elapsedMin / cap) * 100);
  }, [session, phase, elapsedMin]);

  if (!session) {
    return (
      <div className="card p-8 flex flex-col items-center gap-5 text-center">
        <div className="chip rounded-full px-3 py-1 text-xs text-mist-400 uppercase tracking-wide">
          {weekend ? "Weekend mode" : "Weekday mode"}
        </div>
        <h2 className="font-display text-3xl text-mist-100">Ready when you are</h2>
        <p className="text-mist-400 text-sm max-w-sm">
          A session starts a 45-minute block. If you're still going and don't
          confirm by 50 minutes, it quietly runs to 100 — then a longer break.
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => onStart(defaultType)}
            className="rounded-full bg-ember-500 hover:bg-ember-400 text-ink-950 font-semibold px-6 py-3 transition"
          >
            {defaultType === "review" ? "Start review session" : "Start focus session"}
          </button>
          <button
            onClick={onCrash}
            className="chip rounded-full px-5 py-3 text-mist-300 hover:text-mist-100 transition text-sm"
          >
            I can't focus right now
          </button>
        </div>
      </div>
    );
  }

  const copy = PHASE_COPY[phase] || PHASE_COPY.working;

  return (
    <div className="card p-8 flex flex-col items-center gap-5 text-center">
      <div className={`text-xs uppercase tracking-wide ${copy.tone}`}>{copy.label}</div>
      <div className="font-mono-num text-6xl text-mist-100">{formatClock(remainingSec)}</div>
      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-ember-500 transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="text-mist-400 text-sm">
        {phase === "working" && "Confirm opens at 45 minutes."}
        {phase === "awaiting_confirm" &&
          "You're in the window — confirm now for a 10-min break, or keep going and it'll silently extend to 100."}
        {phase === "extended" && "Running to 100 minutes. A 20-min break follows."}
      </p>

      {(phase === "working" || phase === "awaiting_confirm") && (
        <div className="flex gap-3">
          <button
            disabled={phase !== "awaiting_confirm"}
            onClick={onConfirmDone}
            className="rounded-full bg-moss-500 disabled:bg-white/5 disabled:text-mist-400 hover:bg-moss-400 text-ink-950 font-semibold px-6 py-3 transition disabled:cursor-not-allowed"
          >
            I'm done — take my break
          </button>
          <button
            onClick={onAbandon}
            className="chip rounded-full px-5 py-3 text-mist-400 hover:text-mist-200 transition text-sm"
          >
            Abandon session
          </button>
        </div>
      )}
      {phase === "extended" && (
        <button
          onClick={onAbandon}
          className="chip rounded-full px-5 py-3 text-mist-400 hover:text-mist-200 transition text-sm"
        >
          End early
        </button>
      )}
    </div>
  );
}
