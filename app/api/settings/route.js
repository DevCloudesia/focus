import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.from("settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(request) {
  const body = await request.json();
  const allowed = [
    "weekday_wake",
    "weekend_wake",
    "weekday_bedtime",
    "weekend_bedtime",
    "college_deadlines",
  ];
  const patch = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  const db = supabaseAdmin();
  const { data, error } = await db.from("settings").update(patch).eq("id", 1).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
