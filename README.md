# Focus

A personal focus workspace: a 45/50/100-minute work-session timer, ambient +
40Hz music, tasks (school / outside school / college-prep), weekly
spaced-review blocks, a sleep-goal countdown, motivation widgets, and an SAT
prep progress check against [daily-fifty](https://daily-fifty.vercel.app/).

Everything works with zero setup **except** three integrations that need
your own one-time credentials: Google Calendar/Gmail, Slack, and the
browser extension's site-blocking secret. The app runs fine without them —
those widgets just show a "not connected" state until you fill them in.

## Stack

- Next.js 15, React 19
- Supabase Postgres (its own project, `focus-workspace`)
- Deployed on Vercel
- A companion Manifest V3 browser extension (`extension/`) for site
  blocking + Schoology sync

## What's already set up for you

- The `focus-workspace` Supabase project (id `uxclibxyvshrrckihhlz`) with
  the full schema applied (see `supabase/schema.sql`).
- A read-only function (`focus_app_daily_progress`) added to the
  **daily-fifty** Supabase project so this app can show "SAT today: 12/50"
  without ever touching daily-fifty's real tables directly (see
  `supabase/daily_fifty_progress_reader.sql`).
- The Vercel project, deployed from this repo (see the deployment summary
  in your session, or the Vercel dashboard).

## What you still need to do

### 1. Supabase service role key (required — nothing works without this)

The app's API routes use the service role key server-side (never exposed
to the browser) so the tables can stay locked down with no public RLS
policies.

1. Open https://supabase.com/dashboard/project/uxclibxyvshrrckihhlz/settings/api
2. Copy the **service_role** secret key.
3. In Vercel: your project → Settings → Environment Variables → add
   `SUPABASE_SERVICE_ROLE_KEY` with that value (Production + Preview).
4. Also add (already-public values, safe to reuse):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://uxclibxyvshrrckihhlz.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = see `.env.example` for the current one, or grab it fresh from the same API settings page.
   - `DAILY_FIFTY_SUPABASE_URL` = `https://majxhqnyzvnbwkkcpaxw.supabase.co`
   - `DAILY_FIFTY_SUPABASE_ANON_KEY` = see `.env.example`, or grab it from https://supabase.com/dashboard/project/majxhqnyzvnbwkkcpaxw/settings/api
5. Redeploy (Vercel → Deployments → ⋯ → Redeploy) after adding env vars.

### 2. Google Calendar + Gmail + Slack — actually set up differently than planned

The `GOOGLE_CLIENT_ID`/`SLACK_BOT_TOKEN`-style env vars below are **not
what's actually wired up**. Since Gmail, Google Calendar, and Slack were
already connected as claude.ai connectors in the session that built this,
we used those instead of building separate OAuth apps:

- **Calendar wind-down block**: a recurring daily event, 11:30pm–7:30am,
  was created directly on the primary Google Calendar via the connector.
  `settings.weekday_wake` / `weekend_wake` in Supabase are both set to
  `07:30` so the app's own sleep countdown matches it. The website's
  "block wind-down on my calendar" button and `/api/calendar/wind-down`
  route are **not** connected to this — they're dead code unless you do
  the manual OAuth setup below.
- **Gmail/Slack message queue**: a Claude Code Remote Routine ("Focus
  app: sync Gmail + Slack into message queue", hourly, self-bound to the
  session that built this) reads unread Gmail and recent Slack DMs each
  hour and inserts rows straight into `messages_queue` via the Supabase
  MCP tools — bypassing `/api/messages/sync`, `lib/google.js`, and
  `lib/slack.js` entirely. Manage/inspect it at claude.ai's Routines UI,
  or ask Claude in that session to change the cadence, wind-down time, or
  stop it.

This means the message queue only updates while that Claude session
stays alive and that Routine keeps firing — it is **not** the website
running its own background job. If you want the website itself to fetch
Gmail/Slack/Calendar live, independent of any Claude session, do the
manual setup below instead (and then also wire the sleep widget's button
back to `/api/calendar/wind-down`, and point `MessagesInbox`'s "sync now"
at `/api/messages/sync` again).

<details>
<summary>Manual OAuth setup (only if you want the website fully
self-sufficient)</summary>

**Google Calendar + Gmail** — a personal OAuth client + long-lived
refresh token, no login screen:

1. Go to https://console.cloud.google.com/ → create a new project (or
   reuse one) → **APIs & Services → Library** → enable **Google Calendar
   API** and **Gmail API**.
2. **APIs & Services → OAuth consent screen** → User type "External" →
   fill the required fields → add your own Google account as a **test
   user** (keeps it in "testing" mode — fine for personal use, no Google
   review needed).
3. **APIs & Services → Credentials → Create Credentials → OAuth client
   ID** → Application type "Web application" → add
   `https://developers.google.com/oauthplayground` as an authorized
   redirect URI → note the **Client ID** and **Client Secret**.
4. Go to https://developers.google.com/oauthplayground → gear icon (top
   right) → check **"Use your own OAuth credentials"** → paste your
   Client ID/Secret.
5. In the left panel, select these scopes, then **Authorize APIs**:
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/gmail.readonly`
6. Sign in with your Google account, approve access.
7. Click **Exchange authorization code for tokens** — copy the
   **Refresh token** shown.
8. In Vercel, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_REFRESH_TOKEN` (the refresh token from step 7), then redeploy.

**Slack** — a personal bot token from an app in your own workspace:

1. Go to https://api.slack.com/apps → **Create New App → From scratch** →
   pick your workspace.
2. **OAuth & Permissions** → **Bot Token Scopes**, add: `channels:history`,
   `groups:history`, `im:history`, `mpim:history`, `channels:read`,
   `groups:read`, `im:read`, `mpim:read`.
3. **Install to Workspace**, approve.
4. Copy the **Bot User OAuth Token** (`xoxb-…`).
5. Message the bot once (or invite it into channels you want it reading).
6. Find your Slack user ID: profile → **···** → **Copy member ID**.
7. In Vercel, add `SLACK_BOT_TOKEN`, `SLACK_USER_ID`, then redeploy.

</details>

### 4. Extension sync secret (recommended once you use the extension)

The browser extension talks to two of your app's API routes
(`/api/session-state`, `/api/schoology-sync`) which have no other auth —
anyone with your app's URL could otherwise poke them.

1. Generate any random string, e.g. `openssl rand -hex 24`.
2. In Vercel, add `EXTENSION_SYNC_SECRET` with that value, redeploy.
3. In the extension's popup (see `extension/README.md`), paste the same
   value into "Extension secret".

### 5. Install the browser extension

See `extension/README.md` — load it unpacked via `chrome://extensions` in
developer mode, then point it at your deployed app URL.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values above
npm run dev
```

## Customizing the music panel

Track/playlist IDs live in `components/MusicPanel.jsx` (`TRACKS`) — swap
in whatever YouTube videos/playlists you actually want to listen to.

## Weekly review blocks

Spaced review (1/2/5-day, ~2-week pre-exam) is handled as **weekly batch
blocks**, not per-task chains — add them from the "Review blocks" card on
the dashboard (`daily short`, `weekend big`, `pre-exam`). Weekends default
to a review-type session once homework is done, per how weekend mode
works here.

## The 45/50/100 timer, exactly

- A session starts a 45-minute block.
- Between 45–50 minutes, a confirm button appears: click it and the
  session ends immediately with a 10-minute break.
- If you don't click by the 50-minute mark, nothing else is asked — it
  silently keeps running until 100 minutes, then ends on its own with a
  forced 20-minute break.

See `lib/sessionEngine.js` for the exact state machine.
