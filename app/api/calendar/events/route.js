import { NextResponse } from "next/server";
import { googleConfigured, listCalendarEvents } from "@/lib/google";

export async function GET() {
  if (!googleConfigured()) {
    return NextResponse.json({ connected: false, events: [] });
  }
  try {
    const events = await listCalendarEvents({ maxResults: 20, daysAhead: 21 });
    return NextResponse.json({ connected: true, events });
  } catch (err) {
    return NextResponse.json({ connected: true, events: [], error: err.message }, { status: 500 });
  }
}
