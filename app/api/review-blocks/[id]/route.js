import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const patch = {};
  if ("completed" in body) patch.completed = body.completed;
  if ("notes" in body) patch.notes = body.notes;

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("review_blocks")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review_block: data });
}
