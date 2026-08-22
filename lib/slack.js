// Personal-token Slack integration, supporting more than one workspace.
// Each workspace you install the app into gets its own bot token (tokens
// are workspace-scoped), so we read a small numbered list of env vars:
//
//   SLACK_BOT_TOKEN   / SLACK_USER_ID   / SLACK_LABEL   (workspace 1, "legacy" names)
//   SLACK_BOT_TOKEN_2 / SLACK_USER_ID_2 / SLACK_LABEL_2 (workspace 2)
//   SLACK_BOT_TOKEN_3 / SLACK_USER_ID_3 / SLACK_LABEL_3 (workspace 3)
//   SLACK_BOT_TOKEN_4 / SLACK_USER_ID_4 / SLACK_LABEL_4 (workspace 4)
//
// Only slots with both a token and a user ID set are used. No OAuth flow,
// no other users involved — read-only against conversations the bot has
// been added to.

const MAX_WORKSPACES = 4;

export function getSlackWorkspaces() {
  const workspaces = [];
  for (let i = 1; i <= MAX_WORKSPACES; i++) {
    const suffix = i === 1 ? "" : `_${i}`;
    const token = process.env[`SLACK_BOT_TOKEN${suffix}`];
    const userId = process.env[`SLACK_USER_ID${suffix}`];
    if (!token || !userId) continue;
    const label = process.env[`SLACK_LABEL${suffix}`] || `workspace ${i}`;
    workspaces.push({ label, token, userId });
  }
  return workspaces;
}

export function slackConfigured() {
  return getSlackWorkspaces().length > 0;
}

async function slackCall(token, method, params) {
  const res = await fetch(`https://slack.com/api/${method}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack ${method} failed: ${data.error}`);
  return data;
}

async function listRecentMentionsForWorkspace(workspace, maxResults) {
  const { token, userId, label } = workspace;
  const { channels = [] } = await slackCall(token, "conversations.list", {
    types: "im,mpim",
    limit: "20",
  });

  const items = [];
  for (const channel of channels) {
    const { messages = [] } = await slackCall(token, "conversations.history", {
      channel: channel.id,
      limit: "5",
    });
    for (const msg of messages) {
      if (msg.user === userId) continue; // skip your own messages
      items.push({
        external_id: `${label}-${channel.id}-${msg.ts}`,
        summary: (msg.text || "(attachment)").slice(0, 200),
        received_at: new Date(Number(msg.ts) * 1000).toISOString(),
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
    .slice(0, maxResults);
}

// Fetches recent mentions across every configured workspace. A failure in
// one workspace (bad/revoked token) doesn't block the others.
export async function listRecentSlackMentions(maxResultsPerWorkspace = 10) {
  const workspaces = getSlackWorkspaces();
  const results = await Promise.allSettled(
    workspaces.map((w) => listRecentMentionsForWorkspace(w, maxResultsPerWorkspace))
  );

  const items = [];
  const errors = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      errors.push(`${workspaces[i].label}: ${result.reason.message}`);
    }
  });

  if (errors.length > 0 && items.length === 0) {
    throw new Error(errors.join("; "));
  }

  return items.sort((a, b) => new Date(b.received_at) - new Date(a.received_at));
}
