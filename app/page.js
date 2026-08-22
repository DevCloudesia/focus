"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import FocusTimer from "@/components/FocusTimer";
import MusicPanel from "@/components/MusicPanel";
import CrashMode from "@/components/CrashMode";
import PlannerCard from "@/components/PlannerCard";
import SleepWidget from "@/components/SleepWidget";
import MotivationStrip from "@/components/MotivationStrip";
import SatProgress from "@/components/SatProgress";
import MessagesInbox from "@/components/MessagesInbox";
import CalendarPanel from "@/components/CalendarPanel";
import TimeMark from "@/components/TimeMark";
import { isWeekend } from "@/lib/dates";
import { getGreeting } from "@/lib/timeBand";

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `${url} failed`);
  return body;
}

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [crashOpen, setCrashOpen] = useState(false);
  const [musicMode, setMusicMode] = useState("ambient"); // ambient | 40hz
  const [loading, setLoading] = useState(true);
  const weekend = isWeekend();

  const refreshSession = useCallback(async () => {
    const { active } = await fetchJSON("/api/sessions");
    setSession(active);
  }, []);

  const refreshTasks = useCallback(async () => {
    const { tasks } = await fetchJSON("/api/tasks");
    setTasks(tasks);
  }, []);

  const refreshSettings = useCallback(async () => {
    const { settings } = await fetchJSON("/api/settings");
    setSettings(settings);
  }, []);

  useEffect(() => {
    Promise.all([refreshSession(), refreshTasks(), refreshSettings()]).finally(() =>
      setLoading(false)
    );
    const id = setInterval(refreshSession, 15000);
    return () => clearInterval(id);
  }, [refreshSession, refreshTasks, refreshSettings]);

  const startSession = useCallback(
    async (type = "work", taskId = null) => {
      const { session } = await fetchJSON("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, task_id: taskId }),
      });
      setSession(session);
    },
    []
  );

  const confirmDone = useCallback(async () => {
    if (!session) return;
    await fetchJSON(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm_done" }),
    });
    setSession(null);
  }, [session]);

  const forceEnd = useCallback(async () => {
    if (!session) return;
    await fetchJSON(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "force_end" }),
    });
    setSession(null);
  }, [session]);

  const abandon = useCallback(async () => {
    if (!session) return;
    await fetchJSON(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "abandon" }),
    });
    setSession(null);
  }, [session]);

  const isBreakOrIdle = !session;

  const defaultSessionType = useMemo(() => {
    // Weekends default review content once homework is done, per user's rule.
    return weekend ? "review" : "work";
  }, [weekend]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-ink-500">
        Loading your workspace…
      </main>
    );
  }

  return (
    <main className="min-h-screen lg:h-screen flex flex-col">
      <header className="shrink-0 bg-white/50 backdrop-blur-xl border-b border-white/60">
        <div className="px-5 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TimeMark className="w-6 h-6 flex-shrink-0" />
            <span className="font-display font-bold text-lg text-accent-gradient">Focus</span>
            <span className="chip rounded-full px-2.5 py-1 text-[11px] text-ink-500 font-medium ml-1">
              {weekend ? "Weekend" : "Weekday"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SatProgress />
            <Link
              href="/settings"
              className="chip rounded-full px-4 py-2 text-sm text-ink-700 hover:bg-paper-200 transition font-medium"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-5 md:px-8 pb-5 pt-3">
        <div className="shrink-0 mb-3 flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="font-display font-bold text-xl text-ink-900">
            {getGreeting()} — you've got this.
          </h1>
          <p className="text-ink-500 text-sm">
            {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="orbit-grid flex-1 min-h-0">
          <div className="area-calendar orbit-center">
            <CalendarPanel settings={settings} />
          </div>

          <div className="area-timer">
            <FocusTimer
              session={session}
              weekend={weekend}
              defaultType={defaultSessionType}
              onStart={startSession}
              onConfirmDone={confirmDone}
              onForceEnd={forceEnd}
              onAbandon={abandon}
              onCrash={() => setCrashOpen(true)}
            />
          </div>

          <div className="area-sound flex flex-col min-h-0">
            <MusicPanel mode={musicMode} onModeChange={setMusicMode} />
          </div>

          <div className="area-messages">
            {isBreakOrIdle ? (
              <MessagesInbox />
            ) : (
              <div className="card p-5 items-center justify-center text-center text-sm text-ink-400">
                Messages stay quiet during a session.
              </div>
            )}
          </div>

          <div className="area-sleep">
            <SleepWidget settings={settings} onSettingsChange={setSettings} />
          </div>

          <div className="area-motivation">
            <MotivationStrip />
          </div>

          <div className="area-planner">
            <PlannerCard tasks={tasks} onTasksChange={refreshTasks} weekend={weekend} />
          </div>
        </div>
      </div>

      <CrashMode
        open={crashOpen}
        onClose={() => setCrashOpen(false)}
        onStartBeats={() => {
          setMusicMode("40hz");
          setCrashOpen(false);
        }}
      />
    </main>
  );
}
