"use client";

import { useEffect, useState } from "react";
import { daysUntil } from "@/lib/dates";

function formatDayHeader(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
      new Date(today.getFullYear(), today.getMonth(), today.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function dotColor(summary) {
  const s = summary.toLowerCase();
  if (s.includes("sat")) return "bg-coral-500";
  if (s.includes("wind down") || s.includes("sleep")) return "bg-violet-500";
  if (s.includes("college") || s.includes("application")) return "bg-mint-500";
  return "bg-ink-400";
}

export default function CalendarPanel({ settings }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/calendar/events")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ connected: false, events: [] }));
  }, []);

  const nextSat = (settings?.sat_exams || [])
    .filter((s) => daysUntil(s.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const collegeDeadline = (settings?.college_deadlines || []).find((d) =>
    d.label?.toLowerCase().includes("college")
  );

  const grouped = [];
  if (data?.events?.length) {
    let currentDay = null;
    let bucket = null;
    for (const ev of data.events) {
      const day = new Date(ev.start).toDateString();
      if (day !== currentDay) {
        bucket = { day: ev.start, items: [] };
        grouped.push(bucket);
        currentDay = day;
      }
      bucket.items.push(ev);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-ink-900">Calendar</h2>
        <div className="flex gap-2">
          {nextSat && (
            <span className="chip rounded-full px-3 py-1.5 text-xs font-medium text-ink-700">
              SAT in <span className="text-coral-600 font-semibold">{daysUntil(nextSat.date)}d</span>
            </span>
          )}
          {collegeDeadline && (
            <span className="chip rounded-full px-3 py-1.5 text-xs font-medium text-ink-700">
              College apps in{" "}
              <span className="text-mint-600 font-semibold">{daysUntil(collegeDeadline.date)}d</span>
            </span>
          )}
        </div>
      </div>

      {!data && <p className="text-ink-400 text-sm py-6 text-center">Loading…</p>}

      {data && !data.connected && (
        <p className="text-ink-400 text-sm py-6 text-center">
          Google Calendar isn't connected yet — see README.md.
        </p>
      )}

      {data?.connected && grouped.length === 0 && (
        <p className="text-ink-400 text-sm py-6 text-center">Nothing on your calendar for the next 3 weeks.</p>
      )}

      {data?.connected && grouped.length > 0 && (
        <div className="flex flex-col gap-4 max-h-96 overflow-y-auto scrollbar-thin pr-1">
          {grouped.map((bucket) => (
            <div key={bucket.day}>
              <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1.5">
                {formatDayHeader(bucket.day)}
              </div>
              <div className="flex flex-col gap-1.5">
                {bucket.items.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2.5 text-sm py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor(ev.summary)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-ink-900 truncate">{ev.summary}</div>
                      {ev.location && <div className="text-ink-400 text-xs truncate">{ev.location}</div>}
                    </div>
                    <span className="text-ink-400 text-xs flex-shrink-0">
                      {ev.allDay
                        ? "all day"
                        : new Date(ev.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
