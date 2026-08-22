"use client";

import { useEffect, useMemo, useState } from "react";
import { todayAt, minutesUntil, timeOptions, isWeekend } from "@/lib/dates";

async function api(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "request failed");
  return body;
}

const OPTIONS = timeOptions(15);

export default function SleepWidget({ settings, onSettingsChange }) {
  const [now, setNow] = useState(() => new Date());
  const [blocking, setBlocking] = useState(false);
  const [blockMsg, setBlockMsg] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const weekend = isWeekend();
  const wakeKey = weekend ? "weekend_wake" : "weekday_wake";
  const bedtimeKey = weekend ? "weekend_bedtime" : "weekday_bedtime";
  const wakeTime = settings?.[wakeKey]?.slice(0, 5);
  const bedtimeTime = settings?.[bedtimeKey]?.slice(0, 5);

  const bedtime = useMemo(() => {
    if (!bedtimeTime) return null;
    return todayAt(bedtimeTime, now);
  }, [bedtimeTime, now]);

  const minsUntilBed = bedtime ? minutesUntil(bedtime, now) : null;

  const urgency =
    minsUntilBed === null
      ? "text-ink-500"
      : minsUntilBed < 0
      ? "text-coral-600"
      : minsUntilBed < 60
      ? "text-sun-500"
      : "text-ink-900";

  const update = async (fields) => {
    const { settings: updated } = await api("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    onSettingsChange(updated);
  };

  const addWindDownBlock = async () => {
    if (!bedtime || !wakeTime) return;
    setBlocking(true);
    setBlockMsg(null);
    const wake = todayAt(wakeTime, now);
    wake.setDate(wake.getDate() + 1);
    try {
      const res = await api("/api/calendar/wind-down", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedtime: bedtime.toISOString(), wake: wake.toISOString() }),
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
          {weekend ? "Weekend" : "Weekday"}
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
            {blocking ? "Adding…" : "Add Tonight's Block to Calendar"}
          </button>
          {blockMsg && <div className="text-ink-400 text-xs mt-1">{blockMsg}</div>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-ink-500 block mb-1">Bedtime</label>
          <select
            value={bedtimeTime || ""}
            onChange={(e) => update({ [bedtimeKey]: e.target.value })}
            className="w-full bg-paper-100 border border-paper-300 rounded-lg px-2 py-2 text-sm text-ink-900 outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
          >
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink-500 block mb-1">Wake</label>
          <select
            value={wakeTime || ""}
            onChange={(e) => update({ [wakeKey]: e.target.value })}
            className="w-full bg-paper-100 border border-paper-300 rounded-lg px-2 py-2 text-sm text-ink-900 outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
          >
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
