import { NextResponse } from "next/server";
import { googleConfigured, createCalendarEvent } from "@/lib/google";

// Manually triggered from the sleep widget: blocks a "wind down" event on
// your primary Google Calendar from now until your target bedtime.
export async function POST(request) {
  if (!googleConfigured()) {
    return NextResponse.json({ error: "Google Calendar isn't connected yet — see README.md" }, { status: 400 });
  }

  const { bedtime } = await request.json();
  if (!bedtime) return NextResponse.json({ error: "bedtime is required" }, { status: 400 });

  const now = new Date();
  const end = new Date(bedtime);

  try {
    const event = await createCalendarEvent({
      summary: "Wind down — sleep goal",
      description: "Auto-created by the focus app to protect your sleep goal.",
      start: now.toISOString(),
      end: end.toISOString(),
    });
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
