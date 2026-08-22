import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionPhase, breakLengthForPhase } from "@/lib/sessionEngine";

// action: "confirm_done" (clicked within the 45-50 window) or "force_end"
// (used once the 100-min mark is reached, or a manual abandon).
export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action || "confirm_done";

  const db = supabaseAdmin();
  const { data: session, error: fetchErr } = await db
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 });

  const now = new Date();
  const phase = getSessionPhase(session, now);

  if (action === "confirm_done") {
    if (phase !== "working" && phase !== "awaiting_confirm") {
      return NextResponse.json(
        { error: `Can't confirm-done from phase "${phase}"` },
        { status: 409 }
      );
    }
    const extended = false;
    const breakMin = breakLengthForPhase("awaiting_confirm");
    const { data, error } = await db
      .from("sessions")
      .update({
        ended_at: now.toISOString(),
        confirmed_at: now.toISOString(),
        extended_to_100: extended,
        break_length_min: breakMin,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: data });
  }

  if (action === "force_end") {
    // Used when the client detects the 100-minute mark passed with no confirm.
    const extended = phase === "extended" || phase === "extended_complete";
    const breakMin = breakLengthForPhase("extended_complete");
    const { data, error } = await db
      .from("sessions")
      .update({
        ended_at: now.toISOString(),
        extended_to_100: extended,
        break_length_min: breakMin,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: data });
  }

  if (action === "abandon") {
    const { data, error } = await db
      .from("sessions")
      .update({ ended_at: now.toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
