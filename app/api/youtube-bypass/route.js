import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BYPASS_MINUTES = 90;

// Triggered by the "hold 5 seconds" bypass button — temporarily allows
// YouTube through the extension's blocking rules, for a real study need.
export async function POST() {
  const until = new Date(Date.now() + BYPASS_MINUTES * 60 * 1000).toISOString();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("settings")
    .update({ youtube_bypass_until: until, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

// Cancel an active bypass early.
export async function DELETE() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("settings")
    .update({ youtube_bypass_until: null, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
