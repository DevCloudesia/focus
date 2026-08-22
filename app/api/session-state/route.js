import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionPhase } from "@/lib/sessionEngine";
import { isWeekend } from "@/lib/dates";

// Polled by the companion browser extension every few seconds to decide
// whether to block distracting sites right now. Deliberately minimal and
// non-sensitive (no task/message content), so it doesn't need auth beyond
// the optional shared secret.
export async function GET(request) {
  const secret = process.env.EXTENSION_SYNC_SECRET;
  if (secret) {
    const header = request.headers.get("x-extension-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const db = supabaseAdmin();
  const { data: session } = await db
    .from("sessions")
    .select("*")
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: settings } = await db
    .from("settings")
    .select("blocked_sites, youtube_bypass_until")
    .eq("id", 1)
    .single();

  const phase = session ? getSessionPhase(session) : "idle";
  const active = phase === "working" || phase === "awaiting_confirm" || phase === "extended";

  const bypassActive =
    settings?.youtube_bypass_until && new Date(settings.youtube_bypass_until) > new Date();
  const blockedSites = bypassActive
    ? (settings?.blocked_sites ?? []).filter((s) => s !== "youtube.com")
    : settings?.blocked_sites ?? [];

  return NextResponse.json({
    active,
    phase,
    is_weekend: isWeekend(),
    session_type: session?.type ?? null,
    blocked_sites: blockedSites,
    youtube_bypass_until: bypassActive ? settings.youtube_bypass_until : null,
  });
}
