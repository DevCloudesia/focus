"use client";

import { useEffect, useState } from "react";

const AUTO_SYNC_MS = 5 * 60 * 1000;

// Only ever mounted outside an active work session ("true silence" during
// focus — see app/page.js). Auto-syncs in the background every 5 minutes
// while this is on screen — no manual button needed.
export default function MessagesInbox() {
  const [messages, setMessages] = useState(null);

  const load = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => setMessages([]));
  };

  const sync = () => {
    fetch("/api/messages/sync", { method: "POST" })
      .then(load)
      .catch(() => {});
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount, then on its own interval
  useEffect(() => {
    load();
    sync();
    const id = setInterval(sync, AUTO_SYNC_MS);
    return () => clearInterval(id);
  }, []);

  if (messages === null) return null;
  const unseen = messages.filter((m) => !m.seen);

  if (unseen.length === 0) {
    return (
      <div className="card p-5 text-sm text-ink-400 text-center">
        Nothing queued from Gmail.
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
      <h3 className="font-display font-semibold text-base text-ink-900 mb-3">
        While You Were Focused ({unseen.length})
      </h3>
      <div className="flex flex-col gap-2">
        {unseen.map((m) => (
          <div key={m.id} className="flex items-start gap-2 text-sm">
            <span className="chip px-2 py-0.5 text-[10px] text-ink-500 font-medium flex-shrink-0 mt-0.5">
              {m.source}
            </span>
            <span className="text-ink-700 flex-1">{m.summary}</span>
            <button
              onClick={() => markSeen(m.id)}
              className="text-ink-400 hover:text-ink-700 text-xs flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
