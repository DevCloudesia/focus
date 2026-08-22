import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isWeekend } from "@/lib/dates";

export async function GET() {
  const db = supabaseAdmin();
  const { data: active, error: activeErr } = await db
    .from("sessions")
    .select("*")
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeErr) return NextResponse.json({ error: activeErr.message }, { status: 500 });

  const { data: recent, error: recentErr } = await db
    .from("sessions")
    .select("*")
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(20);

  if (recentErr) return NextResponse.json({ error: recentErr.message }, { status: 500 });

  return NextResponse.json({ active, recent });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { type = "work", task_id = null, crash_mode = false } = body;

  const db = supabaseAdmin();

  // Never allow two active sessions at once.
  const { data: existing } = await db
    .from("sessions")
    .select("id")
    .is("ended_at", null)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "A session is already active" }, { status: 409 });
  }

  const { data, error } = await db
    .from("sessions")
    .insert({
      type,
      task_id,
      crash_mode,
      is_weekend: isWeekend(),
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data }, { status: 201 });
}
