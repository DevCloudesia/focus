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
  working: { label: "Deep work", tone: "text-ink-500", ring: "stroke-violet-500" },
  awaiting_confirm: { label: "Done, or keep going?", tone: "text-coral-600", ring: "stroke-coral-500" },
  extended: { label: "Extended session", tone: "text-violet-600", ring: "stroke-violet-500" },
  extended_complete: { label: "Time's up", tone: "text-coral-600", ring: "stroke-coral-500" },
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
      <div className="card card-auto p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 text-center relative overflow-y-auto">
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-60 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #FFE4DA 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-60 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #EBE5FF 0%, transparent 70%)" }}
        />
        <h2 className="font-display font-bold text-lg leading-tight text-ink-900 relative shrink-0">
          Ready when you are
        </h2>
        <p className="text-ink-500 text-xs relative max-w-md shrink-0">
          A 45-minute block — confirm within 5 min to end it, or stay quiet
          and it runs to 100.
        </p>
        <div className="flex flex-col gap-1.5 relative w-full max-w-xs shrink-0">
          <button
            onClick={() => onStart(defaultType)}
            className="btn-primary rounded-full font-display font-semibold px-6 py-2.5 text-sm w-full"
          >
            {defaultType === "review" ? "Start review session" : "Start focus session"}
          </button>
          <button
            onClick={onCrash}
            className="chip rounded-full px-6 py-1.5 text-ink-700 hover:bg-paper-200 transition text-xs font-medium w-full"
          >
            I can't focus right now
          </button>
        </div>
      </div>
    );
  }

  const copy = PHASE_COPY[phase] || PHASE_COPY.working;

  return (
    <div className="card card-auto p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 text-center overflow-y-auto">
      <div className={`text-xs uppercase tracking-wide font-semibold shrink-0 ${copy.tone}`}>{copy.label}</div>
      <div className="font-mono-num font-semibold text-4xl sm:text-5xl text-ink-900 shrink-0">{formatClock(remainingSec)}</div>
      <div className="w-full max-w-sm h-2 rounded-full bg-paper-200 overflow-hidden shrink-0">
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral-500 to-violet-500 transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="text-ink-500 text-sm max-w-sm shrink-0">
        {phase === "working" && "Confirm opens at 45 minutes."}
        {phase === "awaiting_confirm" &&
          "You're in the window — confirm now for a 10-min break, or keep going and it'll silently extend to 100."}
        {phase === "extended" && "Running to 100 minutes. A 20-min break follows."}
      </p>

      {(phase === "working" || phase === "awaiting_confirm") && (
        <div className="flex flex-col gap-2 w-full max-w-xs shrink-0">
          <button
            disabled={phase !== "awaiting_confirm"}
            onClick={onConfirmDone}
            className="rounded-full bg-mint-500 disabled:bg-paper-200 disabled:text-ink-400 hover:bg-mint-600 text-white font-display font-semibold px-8 py-3 transition disabled:cursor-not-allowed w-full"
          >
            I'm done — take my break
          </button>
          <button
            onClick={onAbandon}
            className="chip rounded-full px-6 py-2 text-ink-500 hover:bg-paper-200 transition text-sm w-full"
          >
            Abandon session
          </button>
        </div>
      )}
      {phase === "extended" && (
        <button
          onClick={onAbandon}
          className="chip rounded-full px-6 py-2 text-ink-500 hover:bg-paper-200 transition text-sm w-full max-w-xs shrink-0"
        >
          End early
        </button>
      )}
    </div>
  );
}
