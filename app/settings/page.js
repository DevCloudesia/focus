"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

async function api(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "request failed");
  return body;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [newDeadlineLabel, setNewDeadlineLabel] = useState("");
  const [newDeadlineDate, setNewDeadlineDate] = useState("");
  const [newSite, setNewSite] = useState("");
  const [newQuote, setNewQuote] = useState("");

  const load = () => api("/api/settings").then((d) => setSettings(d.settings));
  useEffect(() => {
    load();
  }, []);

  const patch = async (fields) => {
    const { settings: updated } = await api("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setSettings(updated);
  };

  if (!settings) {
    return (
      <main className="min-h-screen flex items-center justify-center text-mist-300">loading…</main>
    );
  }

  const deadlines = settings.college_deadlines || [];
  const sites = settings.blocked_sites || [];
  const quotes = settings.quotes || [];

  return (
    <main className="min-h-screen bg-ink-950 pb-24">
      <div className="max-w-2xl mx-auto px-6 pt-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl text-mist-100">Settings</h1>
          <Link href="/" className="chip rounded-full px-4 py-2 text-sm text-mist-300 hover:text-mist-100">
            ← back
          </Link>
        </div>

        <section id="sleep" className="card p-6 mb-6">
          <h2 className="font-display text-lg text-mist-100 mb-4">Sleep goals</h2>
          <div className="flex gap-6">
            <div>
              <label className="text-xs text-mist-400 block mb-1">Weekday wake (8h goal)</label>
              <input
                type="time"
                defaultValue={settings.weekday_wake?.slice(0, 5)}
                onBlur={(e) => patch({ weekday_wake: e.target.value })}
                className="bg-white/5 rounded-lg px-3 py-2 text-sm text-mist-100"
              />
            </div>
            <div>
              <label className="text-xs text-mist-400 block mb-1">Weekend wake (9h goal)</label>
              <input
                type="time"
                defaultValue={settings.weekend_wake?.slice(0, 5)}
                onBlur={(e) => patch({ weekend_wake: e.target.value })}
                className="bg-white/5 rounded-lg px-3 py-2 text-sm text-mist-100"
              />
            </div>
          </div>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="font-display text-lg text-mist-100 mb-4">Goals & deadlines</h2>
          <label className="text-xs text-mist-400 block mb-1">October SAT date</label>
          <input
            type="date"
            defaultValue={settings.sat_exam_date || ""}
            onBlur={(e) => patch({ sat_exam_date: e.target.value || null })}
            className="bg-white/5 rounded-lg px-3 py-2 text-sm text-mist-100 mb-4"
          />

          <label className="text-xs text-mist-400 block mb-2">College / application deadlines</label>
          <div className="flex flex-col gap-1.5 mb-3">
            {deadlines.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-mist-300 flex-1">{d.label}</span>
                <span className="text-mist-500 text-xs">{d.date}</span>
                <button
                  onClick={() => patch({ college_deadlines: deadlines.filter((_, j) => j !== i) })}
                  className="text-mist-600 hover:text-mist-300 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newDeadlineLabel}
              onChange={(e) => setNewDeadlineLabel(e.target.value)}
              placeholder="e.g. Common App"
              className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm text-mist-100 placeholder:text-mist-500"
            />
            <input
              type="date"
              value={newDeadlineDate}
              onChange={(e) => setNewDeadlineDate(e.target.value)}
              className="bg-white/5 rounded-lg px-3 py-2 text-sm text-mist-100"
            />
            <button
              onClick={() => {
                if (!newDeadlineLabel || !newDeadlineDate) return;
                patch({
                  college_deadlines: [...deadlines, { label: newDeadlineLabel, date: newDeadlineDate }],
                });
                setNewDeadlineLabel("");
                setNewDeadlineDate("");
              }}
              className="chip rounded-lg px-3 py-2 text-sm text-mist-200 hover:bg-white/5"
            >
              Add
            </button>
          </div>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="font-display text-lg text-mist-100 mb-1">Blocked sites</h2>
          <p className="text-mist-500 text-xs mb-4">
            Used by the companion browser extension during active weekday work
            sessions — see extension/README.md to install it.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {sites.map((s, i) => (
              <span key={i} className="chip rounded-full px-3 py-1 text-xs text-mist-300 flex items-center gap-2">
                {s}
                <button
                  onClick={() => patch({ blocked_sites: sites.filter((_, j) => j !== i) })}
                  className="text-mist-600 hover:text-mist-300"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="youtube.com"
              className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm text-mist-100 placeholder:text-mist-500"
            />
            <button
              onClick={() => {
                if (!newSite.trim()) return;
                patch({ blocked_sites: [...sites, newSite.trim()] });
                setNewSite("");
              }}
              className="chip rounded-lg px-3 py-2 text-sm text-mist-200 hover:bg-white/5"
            >
              Add
            </button>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg text-mist-100 mb-4">Motivational quotes</h2>
          <div className="flex flex-col gap-1.5 mb-3">
            {quotes.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-mist-300 flex-1 italic">"{q}"</span>
                <button
                  onClick={() => patch({ quotes: quotes.filter((_, j) => j !== i) })}
                  className="text-mist-600 hover:text-mist-300 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
              placeholder="Add your own…"
              className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm text-mist-100 placeholder:text-mist-500"
            />
            <button
              onClick={() => {
                if (!newQuote.trim()) return;
                patch({ quotes: [...quotes, newQuote.trim()] });
                setNewQuote("");
              }}
              className="chip rounded-lg px-3 py-2 text-sm text-mist-200 hover:bg-white/5"
            >
              Add
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
