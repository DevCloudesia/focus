import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Reads today's daily-fifty progress via a narrow read-only RPC
// (focus_app_daily_progress) on the daily-fifty Supabase project — see
// supabase/daily_fifty_progress_reader.sql. No write access, no row-level
// content, just today's completed-out-of-50 count.
export async function GET() {
  const url = process.env.DAILY_FIFTY_SUPABASE_URL;
  const key = process.env.DAILY_FIFTY_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ connected: false });
  }

  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client.rpc("focus_app_daily_progress");

  if (error) {
    return NextResponse.json({ connected: true, error: error.message }, { status: 500 });
  }

  const row = data?.[0];
  if (!row) {
    return NextResponse.json({ connected: true, session_date: null, completed_count: 0, total_planned: 0 });
  }

  return NextResponse.json({
    connected: true,
    session_date: row.session_date,
    completed_count: row.completed_count,
    total_planned: row.total_planned,
  });
}
