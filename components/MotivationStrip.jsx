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
    <div className="card px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <p className="font-display text-mist-200 text-sm italic flex-1">"{quote}"</p>
      <div className="flex gap-3 flex-wrap">
        {satDays !== null && (
          <div className="chip rounded-full px-3 py-1.5 text-xs text-mist-300">
            SAT in <span className="text-ember-400 font-semibold">{satDays}d</span>
          </div>
        )}
        {deadlines.slice(0, 2).map((d) => {
          const days = daysUntil(d.date);
          if (days === null) return null;
          return (
            <div key={d.label} className="chip rounded-full px-3 py-1.5 text-xs text-mist-300">
              {d.label} in <span className="text-dusk-400 font-semibold">{days}d</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
