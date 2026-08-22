import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const allowed = ["title", "category", "status", "due_at", "notes", "reviewable"];
  const patch = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  const db = supabaseAdmin();
  const { data, error } = await db.from("tasks").update(patch).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const db = supabaseAdmin();
  const { error } = await db.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
