// Personal-token Slack integration: a single bot token from a Slack app you
// install into your own workspace (see README.md). Reads DMs/mentions for
// your user only — no OAuth flow, no other users involved.

export function slackConfigured() {
  return Boolean(process.env.SLACK_BOT_TOKEN && process.env.SLACK_USER_ID);
}

async function slackCall(method, params) {
  const res = await fetch(`https://slack.com/api/${method}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack ${method} failed: ${data.error}`);
  return data;
}

export async function listRecentSlackMentions(maxResults = 10) {
  const { channels = [] } = await slackCall("conversations.list", {
    types: "im,mpim",
    limit: "20",
  });

  const items = [];
  for (const channel of channels) {
    const { messages = [] } = await slackCall("conversations.history", {
      channel: channel.id,
      limit: "5",
    });
    for (const msg of messages) {
      if (msg.user === process.env.SLACK_USER_ID) continue; // skip your own messages
      items.push({
        external_id: `${channel.id}-${msg.ts}`,
        summary: (msg.text || "(attachment)").slice(0, 200),
        received_at: new Date(Number(msg.ts) * 1000).toISOString(),
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
    .slice(0, maxResults);
}
