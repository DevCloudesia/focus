export function isWeekend(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Turns an "HH:MM" 24h time-of-day string into today's Date object for it.
 */
export function todayAt(timeStr, referenceDate = new Date()) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(referenceDate);
  d.setHours(h, m, 0, 0);
  return d;
}

// 15-minute increments for the bedtime/wake dropdowns, "HH:MM" values with
// a friendly 12h label.
export function timeOptions(stepMinutes = 15) {
  const options = [];
  for (let mins = 0; mins < 24 * 60; mins += stepMinutes) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const period = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const label = `${h12}:${String(m).padStart(2, "0")} ${period}`;
    options.push({ value, label });
  }
  return options;
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
