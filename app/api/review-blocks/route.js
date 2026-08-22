import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const db = supabaseAdmin();
  let query = db.from("review_blocks").select("*").order("block_date", { ascending: true });
  if (from) query = query.gte("block_date", from);
  if (to) query = query.lte("block_date", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review_blocks: data });
}

export async function POST(request) {
  const body = await request.json();
  const { block_date, kind, notes = null } = body;
  if (!block_date || !kind) {
    return NextResponse.json({ error: "block_date and kind are required" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("review_blocks")
    .insert({ block_date, kind, notes })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review_block: data }, { status: 201 });
}
