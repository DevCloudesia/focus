// Pure state-machine logic for the 45/50/100-minute focus session.
//
// Rules (as specified):
// - Work starts, a 45-minute mark opens a confirm window.
// - Click "I'm done" anywhere in [45, 50) min -> session ends now, 10-min break.
// - No click by the 50-minute mark -> silently keep going (no more prompts)
//   until 100 minutes, then a forced 20-minute break.

export const PROMPT_AT_MIN = 45;
export const DECISION_DEADLINE_MIN = 50;
export const EXTENDED_LENGTH_MIN = 100;
export const SHORT_BREAK_MIN = 10;
export const LONG_BREAK_MIN = 20;

export function minutesSince(startedAt, now = new Date()) {
  return (now.getTime() - new Date(startedAt).getTime()) / 60000;
}

/**
 * Given a session's started_at and confirmed_at (or null), and the current
 * time, return the session's phase.
 */
export function getSessionPhase(session, now = new Date()) {
  if (!session || !session.started_at) return "idle";
  if (session.ended_at) return "ended";

  const elapsed = minutesSince(session.started_at, now);

  if (session.confirmed_at) {
    // They confirmed "I'm done" -> already ended, this shouldn't stay active.
    return "ended";
  }

  if (elapsed < PROMPT_AT_MIN) {
    return "working";
  }
  if (elapsed < DECISION_DEADLINE_MIN) {
    return "awaiting_confirm";
  }
  if (elapsed < EXTENDED_LENGTH_MIN) {
    return "extended";
  }
  return "extended_complete";
}

export function breakLengthForPhase(phase) {
  if (phase === "extended_complete") return LONG_BREAK_MIN;
  return SHORT_BREAK_MIN;
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
