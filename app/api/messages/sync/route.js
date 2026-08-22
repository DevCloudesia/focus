import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { googleConfigured, listUnreadGmail } from "@/lib/google";
import { slackConfigured, listRecentSlackMentions } from "@/lib/slack";

// Pulls new Gmail/Slack items into messages_queue. Called by a manual
// "sync now" button, and optionally by the Vercel cron in vercel.json.
// True silence is enforced client-side: this only ever populates the
// queue, nothing here pushes a notification during a work session.
export async function POST() {
  const db = supabaseAdmin();
  let gmailCount = 0;
  let slackCount = 0;
  const errors = [];

  if (googleConfigured()) {
    try {
      const items = await listUnreadGmail(10);
      if (items.length > 0) {
        const { error } = await db
          .from("messages_queue")
          .upsert(
            items.map((i) => ({ source: "gmail", ...i })),
            { onConflict: "source,external_id", ignoreDuplicates: true }
          );
        if (error) throw error;
        gmailCount = items.length;
      }
    } catch (err) {
      errors.push(`gmail: ${err.message}`);
    }
  }

  if (slackConfigured()) {
    try {
      const items = await listRecentSlackMentions(10);
      if (items.length > 0) {
        const { error } = await db
          .from("messages_queue")
          .upsert(
            items.map((i) => ({ source: "slack", ...i })),
            { onConflict: "source,external_id", ignoreDuplicates: true }
          );
        if (error) throw error;
        slackCount = items.length;
      }
    } catch (err) {
      errors.push(`slack: ${err.message}`);
    }
  }

  return NextResponse.json({ gmailCount, slackCount, errors });
}

export async function GET() {
  return POST();
}
