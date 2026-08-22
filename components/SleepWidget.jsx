"use client";

import { useEffect, useMemo, useState } from "react";
import { computeBedtime, minutesUntil, isWeekend } from "@/lib/dates";

async function api(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "request failed");
  return body;
}

export default function SleepWidget({ settings, onSettingsChange }) {
  const [now, setNow] = useState(() => new Date());
  const [blocking, setBlocking] = useState(false);
  const [blockMsg, setBlockMsg] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const weekend = isWeekend();
  const wakeTime = weekend ? settings?.weekend_wake : settings?.weekday_wake;
  const goalHours = weekend ? 9 : 8;

  const bedtime = useMemo(() => {
    if (!wakeTime) return null;
    return computeBedtime(wakeTime.slice(0, 5), goalHours, now);
  }, [wakeTime, goalHours, now]);

  const minsUntilBed = bedtime ? minutesUntil(bedtime, now) : null;

  const urgency =
    minsUntilBed === null
      ? "text-ink-500"
      : minsUntilBed < 0
      ? "text-coral-600"
      : minsUntilBed < 60
      ? "text-sun-500"
      : "text-ink-900";

  const updateWake = async (value) => {
    const key = weekend ? "weekend_wake" : "weekday_wake";
    const { settings: updated } = await api("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    onSettingsChange(updated);
  };

  const addWindDownBlock = async () => {
    if (!bedtime) return;
    setBlocking(true);
    setBlockMsg(null);
    try {
      const res = await api("/api/calendar/wind-down", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedtime: bedtime.toISOString() }),
      });
      setBlockMsg(res.event ? "Added to your calendar." : "Couldn't add it.");
    } catch (err) {
      setBlockMsg(err.message);
    }
    setBlocking(false);
  };

  return (
    <div id="sleep" className="card p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-semibold text-base text-ink-900">Sleep</h3>
        <span className="chip rounded-full px-2 py-0.5 text-[10px] text-ink-500 font-medium">
          {goalHours}h goal
        </span>
      </div>

      {bedtime && (
        <div className="my-3">
          <div className={`font-mono-num font-semibold text-3xl ${urgency}`}>
            {bedtime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-ink-400 text-xs mt-1">
            {minsUntilBed < 0
              ? `${Math.abs(minsUntilBed)} min past target bedtime`
              : `target bedtime, in ${minsUntilBed} min`}
          </div>
          <button
            onClick={addWindDownBlock}
            disabled={blocking}
            className="mt-2 text-violet-500 hover:text-violet-600 text-xs font-medium underline disabled:opacity-50"
          >
            {blocking ? "adding…" : "block wind-down on my calendar"}
          </button>
          {blockMsg && <div className="text-ink-400 text-xs mt-1">{blockMsg}</div>}
        </div>
      )}

      <label className="text-xs text-ink-500 block mb-1">Wake time ({weekend ? "weekend" : "weekday"})</label>
      <input
        type="time"
        defaultValue={wakeTime?.slice(0, 5) || (weekend ? "08:30" : "06:30")}
        onBlur={(e) => updateWake(e.target.value)}
        className="bg-paper-100 border border-paper-300 rounded-lg px-3 py-2 text-sm text-ink-900 outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
      />
    </div>
  );
}
