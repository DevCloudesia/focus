"use client";

import { useState } from "react";
import TaskList from "@/components/TaskList";
import ReviewPanel from "@/components/ReviewPanel";

export default function PlannerCard({ tasks, onTasksChange, weekend }) {
  // Defaults to Tasks; only flips to Review once every task is actually
  // done. Once you pick a tab yourself, that choice sticks for the visit.
  const [manualTab, setManualTab] = useState(null);
  const openCount = tasks.filter((t) => t.status !== "done").length;
  const tab = manualTab ?? (tasks.length > 0 && openCount === 0 ? "review" : "tasks");
  const setTab = setManualTab;

  return (
    <div className="card p-6">
      <div className="shrink-0 flex items-center gap-1 mb-4 chip rounded-full p-1 w-fit">
        <button
          onClick={() => setTab("tasks")}
          className={`rounded-full px-4 py-1.5 text-sm font-display font-medium transition ${
            tab === "tasks" ? "bg-violet-500 text-white" : "text-ink-500 hover:text-ink-900"
          }`}
        >
          Tasks{openCount > 0 ? ` (${openCount})` : ""}
        </button>
        <button
          onClick={() => setTab("review")}
          className={`rounded-full px-4 py-1.5 text-sm font-display font-medium transition ${
            tab === "review" ? "bg-mint-500 text-white" : "text-ink-500 hover:text-ink-900"
          }`}
        >
          Review
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {tab === "tasks" ? (
          <TaskList tasks={tasks} onChange={onTasksChange} />
        ) : (
          <ReviewPanel weekend={weekend} />
        )}
      </div>
    </div>
  );
}
