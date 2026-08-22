export function isWeekend(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Backward-compute a target bedtime from a wake time + sleep goal.
 * wakeTime: "HH:MM" 24h string. sleepGoalHours: number.
 */
export function computeBedtime(wakeTime, sleepGoalHours, referenceDate = new Date()) {
  const [h, m] = wakeTime.split(":").map(Number);
  const wake = new Date(referenceDate);
  wake.setHours(h, m, 0, 0);
  // Wake time is "tomorrow morning" relative to tonight's bedtime.
  wake.setDate(wake.getDate() + 1);
  const bedtime = new Date(wake.getTime() - sleepGoalHours * 60 * 60 * 1000);
  return bedtime;
}

export function minutesUntil(target, now = new Date()) {
  return Math.round((new Date(target).getTime() - now.getTime()) / 60000);
}

export function daysUntil(dateStr, now = new Date()) {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatHM(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
