"use client";

import { useMemo } from "react";
import { daysUntil } from "@/lib/dates";

const DEFAULT_QUOTES = [
  "The goal isn't the SAT score. It's who you become chasing it.",
  "Discipline is choosing between what you want now and what you want most.",
  "Future you is watching. Give them something to work with.",
  "Small reps, repeated, beat one heroic effort.",
];

export default function MotivationStrip({ settings }) {
  const quote = useMemo(() => {
    const pool =
      settings?.quotes && settings.quotes.length > 0 ? settings.quotes : DEFAULT_QUOTES;
    const dayIndex = new Date().getDate();
    return pool[dayIndex % pool.length];
  }, [settings]);

  const satDays = daysUntil(settings?.sat_exam_date);
  const deadlines = settings?.college_deadlines || [];

  return (
    <div className="card p-6 bg-gradient-to-br from-violet-100 via-white to-coral-100">
      <p className="font-display font-medium text-ink-900 text-base leading-snug mb-4">
        "{quote}"
      </p>
      <div className="flex flex-col gap-2">
        {satDays !== null && (
          <div className="flex items-center justify-between">
            <span className="text-ink-500 text-xs">SAT</span>
            <span className="font-mono-num font-semibold text-coral-600 text-sm">{satDays}d</span>
          </div>
        )}
        {deadlines.slice(0, 3).map((d) => {
          const days = daysUntil(d.date);
          if (days === null) return null;
          return (
            <div key={d.label} className="flex items-center justify-between">
              <span className="text-ink-500 text-xs truncate pr-2">{d.label}</span>
              <span className="font-mono-num font-semibold text-violet-600 text-sm flex-shrink-0">
                {days}d
              </span>
            </div>
          );
        })}
        {satDays === null && deadlines.length === 0 && (
          <p className="text-ink-400 text-xs">
            Set your SAT date and deadlines in Settings.
          </p>
        )}
      </div>
    </div>
  );
}
