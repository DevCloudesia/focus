"use client";

import { useMemo } from "react";

// Curated automatically — no manual input needed. One rotates in per day.
const QUOTES = [
  "The goal isn't the SAT score. It's who you become chasing it.",
  "Discipline is choosing between what you want now and what you want most.",
  "Future you is watching. Give them something to work with.",
  "Small reps, repeated, beat one heroic effort.",
  "Motivation gets you started. Habit keeps you going.",
  "You don't rise to the level of your goals, you fall to the level of your systems.",
  "Nobody's coming to save you from your own procrastination — start anyway.",
  "The work you avoid today is still there tomorrow, plus interest.",
  "Progress is invisible day to day and obvious year to year.",
  "Comfort and growth don't share the same room.",
  "Every session you finish is proof you can finish the next one.",
  "Long-term thinking is a competitive advantage almost nobody uses.",
  "You're not behind. You're exactly on the timeline your effort has built.",
  "The version of you that gets into a great school starts as the version who sits down anyway.",
  "Discipline weighs ounces. Regret weighs tons.",
  "It's not about having time. It's about making the next 45 minutes count.",
  "Good enough, done, beats perfect, someday.",
  "Nobody remembers the days that felt hard. They remember what those days built.",
  "You are one focused session away from momentum.",
  "The SAT ends in four hours. The habits you're building don't.",
  "Success is a few simple disciplines, practiced every day.",
  "What you do in the next hour compounds more than you think.",
  "Skill is just discomfort you've survived enough times.",
  "The best time to focus was earlier. The next best time is right now.",
];

export default function MotivationStrip() {
  const quote = useMemo(() => {
    const dayIndex = new Date().getDate() + new Date().getMonth() * 31;
    return QUOTES[dayIndex % QUOTES.length];
  }, []);

  return (
    <div className="card p-5 bg-gradient-to-br from-violet-100 via-white to-coral-100">
      <p className="font-display font-medium text-ink-900 text-base leading-snug">"{quote}"</p>
    </div>
  );
}
