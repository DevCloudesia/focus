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
      <main className="min-h-screen flex items-center justify-center text-ink-500">
        Loading…
      </main>
    );
  }

  const deadlines = settings.college_deadlines || [];
  const satExams = settings.sat_exams || [];

  const inputClass =
    "bg-paper-100 border border-paper-300 rounded-lg px-3 py-2 text-sm text-ink-900 outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400";

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-white/50 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-ink-900">Settings</h1>
          <Link href="/" className="chip rounded-full px-4 py-2 text-sm text-ink-700 hover:bg-paper-200 font-medium">
            ← back
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-8">
        <section className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-1">Sleep goals</h2>
          <p className="text-ink-500 text-sm">
            Bedtime and wake time are set from the <strong>Sleep</strong> card on the dashboard —
            they change per weekday/weekend automatically.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">SAT dates</h2>
          <div className="flex flex-col gap-3 mb-2">
            {satExams.map((exam, i) => (
              <div key={i} className="text-sm">
                <div className="text-ink-900 font-medium">{exam.label}</div>
                <div className="text-ink-500 text-xs mt-0.5">
                  {exam.date} · {exam.time} · {exam.test_center}
                </div>
              </div>
            ))}
            {satExams.length === 0 && (
              <p className="text-ink-400 text-sm">No SAT dates saved yet.</p>
            )}
          </div>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">Goals & deadlines</h2>
          <label className="text-xs text-ink-500 block mb-2">College / application deadlines</label>
          <div className="flex flex-col gap-1.5 mb-3">
            {deadlines.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-ink-900 flex-1">{d.label}</span>
                <span className="text-ink-400 text-xs">{d.date}</span>
                <button
                  onClick={() => patch({ college_deadlines: deadlines.filter((_, j) => j !== i) })}
                  className="text-ink-400 hover:text-coral-500 text-xs"
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
              className={`flex-1 ${inputClass}`}
            />
            <input
              type="date"
              value={newDeadlineDate}
              onChange={(e) => setNewDeadlineDate(e.target.value)}
              className={inputClass}
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
              className="btn-primary rounded-xl px-4 py-2 text-sm font-display font-semibold"
            >
              Add
            </button>
          </div>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-1">Blocked sites</h2>
          <p className="text-ink-500 text-sm">
            Always just <strong>youtube.com</strong> during active weekday work sessions — hold
            the "unlock YouTube" button on the dashboard for 5 seconds if you need it for study.
            See <code>extension/README.md</code> to install the blocking extension.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-1">Motivational quotes</h2>
          <p className="text-ink-500 text-sm">
            Auto-curated — a new one shows up each day, no input needed.
          </p>
        </section>
      </div>
    </main>
  );
}
