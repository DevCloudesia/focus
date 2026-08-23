// Shared date-bucket logic for the task list's date tabs and for the
// Tasks(#) badge on PlannerCard — kept in one place so both agree on
// exactly where "today", "tomorrow", and "this week" start and end.

export function getDateBounds() {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTomorrow = new Date(startToday);
  startTomorrow.setDate(startTomorrow.getDate() + 1);
  const endTomorrow = new Date(startToday);
  endTomorrow.setDate(endTomorrow.getDate() + 2);
  const endWeek = new Date(startToday);
  endWeek.setDate(endWeek.getDate() + 7);
  return { startToday, startTomorrow, endTomorrow, endWeek };
}

// Anything overdue or due today/tomorrow counts as "today & tomorrow" —
// overdue items need attention now, not less of it.
export function isDueTodayOrTomorrow(task, bounds = getDateBounds()) {
  if (!task.due_at) return false;
  return new Date(task.due_at) < bounds.endTomorrow;
}

export const DATE_TABS = [
  { id: "all", label: "All" },
  { id: "today_tomorrow", label: "Today & Tomorrow" },
  { id: "week", label: "This Week" },
  { id: "future", label: "Future" },
];

export function matchesDateTab(task, tab, bounds = getDateBounds()) {
  if (tab === "all") return true;
  const due = task.due_at ? new Date(task.due_at) : null;
  if (tab === "today_tomorrow") return !!due && due < bounds.endTomorrow;
  if (tab === "week") return !!due && due >= bounds.endTomorrow && due < bounds.endWeek;
  if (tab === "future") return !due || due >= bounds.endWeek;
  return true;
}

// Short label for a task row: "Overdue" / "Today" / "Tomorrow" / "Aug 25".
export function formatDueLabel(due_at, bounds = getDateBounds()) {
  if (!due_at) return null;
  const due = new Date(due_at);
  if (due < bounds.startToday) return "Overdue";
  if (due < bounds.startTomorrow) return "Today";
  if (due < bounds.endTomorrow) return "Tomorrow";
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
