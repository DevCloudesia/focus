"use client";

import { useEffect, useState } from "react";

// Only ever mounted outside an active work session ("true silence" during
// focus — see app/page.js). This is where anything that queued up shows up.
export default function MessagesInbox() {
  const [messages, setMessages] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const load = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => setMessages([]));
  };

  useEffect(load, []);

  const syncNow = async () => {
    setSyncing(true);
    await fetch("/api/messages/sync", { method: "POST" }).catch(() => {});
    load();
    setSyncing(false);
  };

  if (messages === null) return null;
  const unseen = messages.filter((m) => !m.seen);

  if (unseen.length === 0) {
    return (
      <div className="card p-5 text-sm text-mist-500 text-center flex items-center justify-center gap-3">
        Nothing queued from Gmail or Slack.
        <button onClick={syncNow} className="text-mist-400 hover:text-mist-200 text-xs underline">
          {syncing ? "syncing…" : "sync now"}
        </button>
      </div>
    );
  }

  const markSeen = async (id) => {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, seen: true }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, seen: true } : m)));
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-base text-mist-100">
          While you were focused ({unseen.length})
        </h3>
        <button onClick={syncNow} className="text-mist-500 hover:text-mist-300 text-xs underline">
          {syncing ? "syncing…" : "sync now"}
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {unseen.map((m) => (
          <div key={m.id} className="flex items-start gap-2 text-sm">
            <span className="chip rounded-full px-2 py-0.5 text-[10px] text-mist-400 flex-shrink-0 mt-0.5">
              {m.source}
            </span>
            <span className="text-mist-300 flex-1">{m.summary}</span>
            <button
              onClick={() => markSeen(m.id)}
              className="text-mist-600 hover:text-mist-300 text-xs flex-shrink-0"
            >
              dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
