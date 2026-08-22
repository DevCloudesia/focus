"use client";

import { useState } from "react";

const CATEGORY_LABEL = {
  school: "School",
  outside: "Outside school",
  college_prep: "College / future",
};

async function api(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "request failed");
  return body;
}

export default function TaskList({ tasks, onChange, weekend }) {
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
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-mist-100">
          {weekend ? "Weekend list" : "Tasks"}
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-transparent chip rounded-lg text-xs text-mist-300 px-2 py-1"
        >
          <option value="all">All</option>
          <option value="school">School</option>
          <option value="outside">Outside school</option>
          <option value="college_prep">College / future</option>
        </select>
      </div>

      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm text-mist-100 placeholder:text-mist-500 outline-none focus:ring-1 focus:ring-ember-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white/5 rounded-lg px-2 py-2 text-xs text-mist-300"
        >
          <option value="school">School</option>
          <option value="outside">Outside</option>
          <option value="college_prep">College</option>
        </select>
        <button className="chip rounded-lg px-3 py-2 text-sm text-mist-200 hover:bg-white/5">
          Add
        </button>
      </form>

      <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto scrollbar-thin">
        {open.length === 0 && done.length === 0 && (
          <p className="text-mist-500 text-sm py-4 text-center">Nothing here yet.</p>
        )}
        {open.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={toggleDone} onRemove={remove} />
        ))}
        {done.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1.5">
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
    <div className="flex items-center gap-2 group">
      <button
        onClick={() => onToggle(task)}
        className={`w-4 h-4 rounded-full border flex-shrink-0 transition ${
          done ? "bg-moss-500 border-moss-500" : "border-mist-500"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className={`text-sm truncate ${done ? "text-mist-500 line-through" : "text-mist-200"}`}>
          {task.title}
        </div>
      </div>
      <span className="chip rounded-full px-2 py-0.5 text-[10px] text-mist-400 flex-shrink-0">
        {CATEGORY_LABEL[task.category]}
      </span>
      {task.source === "schoology" && (
        <span className="text-[10px] text-dusk-400 flex-shrink-0">schoology</span>
      )}
      <button
        onClick={() => onRemove(task)}
        className="text-mist-600 hover:text-mist-300 text-xs opacity-0 group-hover:opacity-100 transition flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
