import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") || 14);

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("sleep_log")
    .select("*")
    .order("log_date", { ascending: false })
    .limit(days);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sleep_log: data });
}

export async function POST(request) {
  const body = await request.json();
  const { log_date, target_wake, target_bedtime, actual_sleep_at, actual_wake_at } = body;
  if (!log_date) return NextResponse.json({ error: "log_date is required" }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("sleep_log")
    .upsert(
      { log_date, target_wake, target_bedtime, actual_sleep_at, actual_wake_at },
      { onConflict: "log_date" }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sleep_log: data }, { status: 201 });
}
