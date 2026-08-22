"use client";

import { useEffect, useState } from "react";

const KIND_LABEL = {
  daily_short: "Daily short review",
  weekend_big: "Weekend big review",
  pre_exam: "Pre-exam (2-week) review",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReviewPanel({ weekend }) {
  const [blocks, setBlocks] = useState([]);

  const load = () => {
    const from = new Date();
    from.setDate(from.getDate() - 7);
    const to = new Date();
    to.setDate(to.getDate() + 14);
    const qs = `?from=${from.toISOString().slice(0, 10)}&to=${to.toISOString().slice(0, 10)}`;
    fetch(`/api/review-blocks${qs}`)
      .then((r) => r.json())
      .then((d) => setBlocks(d.review_blocks || []));
  };

  useEffect(load, []);

  const addBlock = async (kind) => {
    await fetch("/api/review-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ block_date: todayISO(), kind }),
    });
    load();
  };

  const toggle = async (block) => {
    await fetch(`/api/review-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !block.completed }),
    });
    load();
  };

  const upcoming = blocks.filter((b) => !b.completed);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-ink-500 text-xs">
          1 / 2 / 5-day and 2-week spacing, as weekly batches.
        </p>
        {weekend && (
          <span className="chip rounded-full px-2 py-0.5 text-[10px] text-violet-600 font-medium">
            HW done — review day
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 my-4 max-h-40 overflow-y-auto scrollbar-thin">
        {upcoming.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-4">No review blocks queued.</p>
        )}
        {upcoming.map((b) => (
          <div key={b.id} className="flex items-center gap-2.5 text-sm py-1">
            <button
              onClick={() => toggle(b)}
              className="w-5 h-5 rounded-full border-2 border-paper-300 hover:border-mint-400 flex-shrink-0 transition"
            />
            <span className="text-ink-900 flex-1">{KIND_LABEL[b.kind]}</span>
            <span className="text-ink-400 text-xs">{b.block_date}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => addBlock("daily_short")}
          className="chip rounded-full px-3 py-1.5 text-xs text-ink-700 hover:bg-paper-200 font-medium"
        >
          + daily short
        </button>
        <button
          onClick={() => addBlock("weekend_big")}
          className="chip rounded-full px-3 py-1.5 text-xs text-ink-700 hover:bg-paper-200 font-medium"
        >
          + weekend big
        </button>
        <button
          onClick={() => addBlock("pre_exam")}
          className="chip rounded-full px-3 py-1.5 text-xs text-ink-700 hover:bg-paper-200 font-medium"
        >
          + pre-exam
        </button>
      </div>
    </div>
  );
}
