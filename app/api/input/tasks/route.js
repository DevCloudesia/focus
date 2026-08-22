import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Deliberately unauthenticated — see README.md "Weekly Schoology update via
// ChatGPT". Accepts one task per line: "Title | YYYY-MM-DD" (date
// optional). Replaces the current open (not-done) Schoology-sourced tasks
// with this new list, so a weekly full re-paste stays clean instead of
// accumulating stale duplicates. Completed tasks are left alone.
function parseLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titlePart, datePart] = line.split("|").map((s) => s?.trim());
      const due_at =
        datePart && !Number.isNaN(Date.parse(datePart)) ? new Date(datePart).toISOString() : null;
      return { title: titlePart, due_at };
    })
    .filter((t) => t.title);
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  let text = "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    text = body.text || "";
  } else {
    const form = await request.formData();
    text = form.get("text") || "";
  }

  const items = parseLines(text);
  if (items.length === 0) {
    return NextResponse.json({ error: "No valid lines found" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error: deleteError } = await db
    .from("tasks")
    .delete()
    .eq("source", "schoology")
    .neq("status", "done");
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { data, error } = await db
    .from("tasks")
    .insert(
      items.map((item) => ({
        title: item.title,
        due_at: item.due_at,
        category: "school",
        source: "schoology",
      }))
    )
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.redirect(new URL("/view", request.url), { status: 303 });
}
