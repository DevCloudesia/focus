import { NextResponse } from "next/server";
import { googleConfigured, createCalendarEvent } from "@/lib/google";

// Manually triggered from the sleep widget: adds a one-off "wind down"
// block on your primary Google Calendar from tonight's bedtime to
// tomorrow's wake time. The recurring weekday/weekend blocks already sit
// on the calendar permanently — this is just for an ad-hoc one-off add.
export async function POST(request) {
  if (!googleConfigured()) {
    return NextResponse.json({ error: "Google Calendar isn't connected yet — see README.md" }, { status: 400 });
  }

  const { bedtime, wake } = await request.json();
  if (!bedtime || !wake) {
    return NextResponse.json({ error: "bedtime and wake are required" }, { status: 400 });
  }

  try {
    const event = await createCalendarEvent({
      summary: "Wind down — sleep goal",
      description: "Added on demand from the focus app.",
      start: new Date(bedtime).toISOString(),
      end: new Date(wake).toISOString(),
    });
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
