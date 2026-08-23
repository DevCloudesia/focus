"use client";

import { useState } from "react";

const CATEGORY_LABEL = {
  school: "School",
  outside: "Outside School",
  college_prep: "College / Future",
};

const CATEGORY_DOT = {
  school: "bg-violet-500",
  outside: "bg-mint-500",
  college_prep: "bg-coral-500",
};

async function api(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "request failed");
  return body;
}

export default function TaskList({ tasks, onChange }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("school");
  const [filter, setFilter] = useState("all");

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category }),
    });
    setTitle("");
    onChange();
  };

  const toggleDone = async (task) => {
    const status = task.status === "done" ? "todo" : "done";
    await api(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onChange();
  };

  const remove = async (task) => {
    await api(`/api/tasks/${task.id}`, { method: "DELETE" });
    onChange();
  };

  const visible = tasks.filter((t) => filter === "all" || t.category === filter);
  const open = visible.filter((t) => t.status !== "done");
  const done = visible.filter((t) => t.status === "done");

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="shrink-0 flex gap-1.5 mb-4 flex-wrap">
        {["all", "school", "outside", "college_prep"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === f ? "btn-primary" : "chip text-ink-500 hover:text-ink-900"
            }`}
          >
            {f === "all" ? "All" : CATEGORY_LABEL[f]}
          </button>
        ))}
      </div>

      <form onSubmit={addTask} className="shrink-0 flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 min-w-0 bg-white/70 border border-white/70 rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-violet-400"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="shrink-0 bg-white/70 border border-white/70 rounded-xl px-2 py-2.5 text-xs text-ink-700"
        >
          <option value="school">School</option>
          <option value="outside">Outside</option>
          <option value="college_prep">College</option>
        </select>
        <button className="shrink-0 btn-primary rounded-xl px-5 py-2.5 text-sm font-display font-semibold">
          Add
        </button>
      </form>

      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto scrollbar-thin pr-1">
        {open.length === 0 && done.length === 0 && (
          <p className="text-ink-400 text-sm py-6 text-center">
            Nothing here yet — add your first task above.
          </p>
        )}
        {open.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={toggleDone} onRemove={remove} />
        ))}
        {done.length > 0 && (
          <div className="mt-2 pt-3 border-t border-white/70 flex flex-col gap-2">
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleDone} onRemove={remove} done />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onRemove, done }) {
  return (
    <div className="task-row flex items-center gap-3 group px-3 py-2.5">
      <button
        onClick={() => onToggle(task)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition flex items-center justify-center ${
          done ? "bg-mint-500 border-mint-500" : "border-ink-400/40 hover:border-mint-400"
        }`}
      >
        {done && (
          <svg viewBox="0 0 12 12" className="w-3 h-3 fill-none stroke-white stroke-2">
            <path d="M2 6l2.5 2.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CATEGORY_DOT[task.category]}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm truncate ${done ? "text-ink-400 line-through" : "text-ink-900"}`}>
          {task.title}
        </div>
      </div>
      {task.source === "schoology" && (
        <span className="chip px-2 py-0.5 text-[10px] text-violet-600 font-medium flex-shrink-0">
          Schoology
        </span>
      )}
      <button
        onClick={() => onRemove(task)}
        className="text-ink-400 hover:text-coral-500 text-xs opacity-0 group-hover:opacity-100 transition flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
