"use client";

import { daysUntil } from "@/lib/dates";

// The actual, real Google Calendar — embedded directly. Works because
// you're signed into your own Google account in this browser; no public
// sharing needed. Change GOOGLE_CALENDAR_ID below if you ever switch
// calendars.
const GOOGLE_CALENDAR_ID = "imathtery@gmail.com";
const TIMEZONE = "America/Los_Angeles";

const EMBED_SRC = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
  GOOGLE_CALENDAR_ID
)}&ctz=${encodeURIComponent(TIMEZONE)}&mode=WEEK&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0`;

export default function CalendarPanel({ settings }) {
  const nextSat = (settings?.sat_exams || [])
    .filter((s) => daysUntil(s.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const collegeDeadline = (settings?.college_deadlines || []).find((d) =>
    d.label?.toLowerCase().includes("college")
  );

  return (
    <div className="card p-6">
      <div className="shrink-0 flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl text-ink-900">Calendar</h2>
        <div className="flex gap-2">
          {nextSat && (
            <span className="chip px-3 py-1.5 text-xs font-medium text-ink-700">
              SAT in <span className="text-coral-600 font-semibold">{daysUntil(nextSat.date)}d</span>
            </span>
          )}
          {collegeDeadline && (
            <span className="chip px-3 py-1.5 text-xs font-medium text-ink-700">
              College Apps in{" "}
              <span className="text-mint-600 font-semibold">{daysUntil(collegeDeadline.date)}d</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[320px] lg:min-h-0 rounded-2xl overflow-hidden border border-white/70">
        <iframe
          src={EMBED_SRC}
          style={{ border: 0, width: "100%", height: "100%", display: "block" }}
          title="Google Calendar"
        />
      </div>
    </div>
  );
}
