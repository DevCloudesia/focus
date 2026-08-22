// Personal-token Google integration (Calendar + Gmail). No login flow: a
// one-time OAuth client + refresh token are set up per README.md and stored
// as server env vars. Every call here exchanges the refresh token for a
// short-lived access token — simple and fine at this call volume.

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export function googleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

export async function createCalendarEvent({ summary, description, start, end }) {
  const token = await getAccessToken();
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: start },
        end: { dateTime: end },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Calendar event create failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function listUnreadGmail(maxResults = 10) {
  const token = await getAccessToken();
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      "is:unread newer_than:1d"
    )}&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!listRes.ok) {
    throw new Error(`Gmail list failed: ${listRes.status} ${await listRes.text()}`);
  }
  const { messages = [] } = await listRes.json();

  const detailed = await Promise.all(
    messages.map(async (m) => {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const headers = data.payload?.headers || [];
      const from = headers.find((h) => h.name === "From")?.value || "unknown";
      const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
      return {
        external_id: m.id,
        summary: `${subject} — ${from}`,
        received_at: new Date(Number(data.internalDate)).toISOString(),
      };
    })
  );

  return detailed.filter(Boolean);
}
