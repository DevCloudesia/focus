import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// True-silence model: nothing ever "pushes" during a session. The client
// only calls this endpoint from the break/inbox view, never during an
// active work phase. Gmail/Slack polling (once tokens are configured, see
// README) writes rows into messages_queue for this to read.
export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("messages_queue")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, seen = true } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("messages_queue")
    .update({ seen })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
