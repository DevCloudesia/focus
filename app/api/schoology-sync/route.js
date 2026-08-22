import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Called by the companion browser extension's Schoology scraper.
// Body: { items: [{ title, due_at, notes }] }
export async function POST(request) {
  const secret = process.env.EXTENSION_SYNC_SECRET;
  if (secret) {
    const header = request.headers.get("x-extension-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "items[] is required" }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Avoid duplicate imports: skip titles that already exist as an
  // untouched schoology-sourced task.
  const { data: existing } = await db
    .from("tasks")
    .select("title")
    .eq("source", "schoology");
  const existingTitles = new Set((existing || []).map((t) => t.title));

  const toInsert = items
    .filter((item) => item.title && !existingTitles.has(item.title))
    .map((item) => ({
      title: item.title.trim(),
      category: "school",
      source: "schoology",
      due_at: item.due_at || null,
      notes: item.notes || null,
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ inserted: 0, skipped: items.length });
  }

  const { data, error } = await db.from("tasks").insert(toInsert).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ inserted: data.length, skipped: items.length - data.length });
}
