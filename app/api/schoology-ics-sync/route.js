import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseIcsEvents } from "@/lib/schoologyIcs";

// How far back to still pull in an assignment that's already due (in case
// it was recently added or your session missed a sync), and how far
// forward to bother looking — Schoology's feed covers the whole school
// year, most of which is irrelevant on any given day.
const PAST_WINDOW_DAYS = 14;
const FUTURE_WINDOW_DAYS = 180;

// Pulls assignments directly from Schoology's own iCal feed (Settings →
// Calendar in Schoology has a "Subscribe" link that gives you this URL —
// it's a private, unauthenticated link, so treat it like a secret) and
// keeps the task list in sync automatically, no manual paste-in needed.
// Called by Vercel Cron (see vercel.json) and by a manual "sync now" call.
export async function POST() {
  const feedUrl = process.env.SCHOOLOGY_ICS_URL;
  if (!feedUrl) {
    return NextResponse.json({ error: "SCHOOLOGY_ICS_URL is not configured" }, { status: 400 });
  }

  const fetchUrl = feedUrl.replace(/^webcal:\/\//i, "https://");
  let icsText;
  try {
    const res = await fetch(fetchUrl, { headers: { Accept: "text/calendar" } });
    if (!res.ok) throw new Error(`feed responded ${res.status}`);
    icsText = await res.text();
  } catch (err) {
    return NextResponse.json({ error: `Couldn't fetch the feed: ${err.message}` }, { status: 502 });
  }

  const events = parseIcsEvents(icsText);

  const now = Date.now();
  const minDue = now - PAST_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const maxDue = now + FUTURE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const relevant = events.filter((e) => {
    if (!e.dueAt) return false;
    const t = new Date(e.dueAt).getTime();
    return t >= minDue && t <= maxDue;
  });

  const db = supabaseAdmin();

  // One-time cleanup per assignment: earlier syncs (the old ChatGPT/paste
  // flow, or the extension's scraper) inserted schoology tasks with no
  // external_id, so they'd otherwise sit alongside the properly-tracked
  // ones this route creates. Only ever touches *open* schoology tasks —
  // anything already marked done, or anything already tracked by
  // external_id, is left alone.
  await db.from("tasks").delete().eq("source", "schoology").is("external_id", null).neq("status", "done");

  if (relevant.length === 0) {
    return NextResponse.json({ synced: 0, totalInFeed: events.length });
  }

  const { data, error } = await db
    .from("tasks")
    .upsert(
      relevant.map((e) => ({
        title: e.summary,
        due_at: e.dueAt,
        category: "school",
        source: "schoology",
        external_id: e.uid,
      })),
      { onConflict: "source,external_id" }
    )
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ synced: data.length, totalInFeed: events.length });
}

export async function GET() {
  return POST();
}
