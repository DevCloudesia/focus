// Minimal iCalendar (RFC 5545) event parser — just enough to read
// Schoology's assignment feed (SUMMARY/UID/DTSTART per VEVENT). Doesn't
// handle recurrence (RRULE) since Schoology assignments are one-off
// events, not recurring ones.

function unfoldLines(text) {
  // Folded lines continue on the next line with a leading space/tab.
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function unescapeText(value) {
  return value.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

// "20260905" -> "2026-09-05" (all-day); "20260905T235900Z" -> ISO datetime.
function parseIcsDate(value) {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (h === undefined) return `${y}-${mo}-${d}`;
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}${z ? "Z" : ""}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseIcsEvents(icsText) {
  const lines = unfoldLines(icsText)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current?.uid && current?.summary) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const rawKey = line.slice(0, idx);
    const value = line.slice(idx + 1);
    const key = rawKey.split(";")[0];

    if (key === "SUMMARY") current.summary = unescapeText(value).trim();
    else if (key === "UID") current.uid = value.trim();
    else if (key === "DTSTART") current.dueAt = parseIcsDate(value);
  }

  return events;
}
