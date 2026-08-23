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

### 2. Google Calendar + Gmail (Vercel-native, no Claude involved)

This runs entirely as the website's own serverless function on a Vercel
Cron schedule — once it's set up, it works with zero ongoing Claude
session, exactly like the rest of the app.

**Already done, independent of this setup**: a recurring daily calendar
event, 11:30pm–7:30am, exists on your primary Google Calendar (created
once, directly, outside of any of the machinery below — it just sits on
your calendar permanently, nothing keeps it there). `settings.weekday_wake`
/ `weekend_wake` in Supabase are both set to `07:30` so the app's own
sleep countdown matches it.

**Still needs setup**: the Gmail message-queue sync and the "block
wind-down on my calendar" button both call `/api/calendar/wind-down` /
`/api/messages/sync`, which need real Google credentials (see below).
`vercel.json` already has a cron job wired to call `/api/messages/sync`
— **but Vercel's Hobby plan only runs cron jobs once per day**, currently
set to 13:00 UTC (6am Pacific). That means the Gmail queue only refreshes
once a day unless you upgrade to Vercel Pro (paid, monthly) for
higher-frequency cron — I won't do that without you asking, since it's a
billing change. In the meantime, the "sync now" button in the app works
on demand regardless of cron frequency.

Slack isn't wired up at all right now (the manual bot-token path is
documented below if you want it later, but nothing calls it yet).

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

**Slack** — a personal bot token from an app in your own workspace. Since
bot tokens are workspace-scoped, installing the same app into a second
workspace gets you a second token — the app supports up to 4 workspaces
at once (see `lib/slack.js`).

1. Go to https://api.slack.com/apps → **Create New App → From scratch** →
   pick your workspace.
2. **OAuth & Permissions** → **Bot Token Scopes**, add: `channels:history`,
   `groups:history`, `im:history`, `mpim:history`, `channels:read`,
   `groups:read`, `im:read`, `mpim:read`.
3. **App Home** → **Show Tabs → Messages Tab** → check "Allow users to
   send Slash commands and messages from the Messages Tab" (otherwise you
   can't DM the bot, which it needs so it has a conversation to read).
4. **Install to Workspace**, approve.
5. Copy the **Bot User OAuth Token** (`xoxb-…`).
6. Message the bot once (or invite it into channels you want it reading)
   — it can only ever read conversations it's actually a participant in,
   not your existing DMs with other people.
7. Find your Slack user ID: profile → **···** → **Copy member ID**.
8. In Vercel, add `SLACK_BOT_TOKEN`, `SLACK_USER_ID` (and optionally
   `SLACK_LABEL` to name it), then redeploy.

**To add a second workspace**: repeat steps 1–7 from that other
workspace's context (api.slack.com lets you switch which workspace
you're installing into), then add `SLACK_BOT_TOKEN_2`, `SLACK_USER_ID_2`,
`SLACK_LABEL_2` in Vercel instead of overwriting the first set. `_3`/`_4`
for a third/fourth.

### 3. Extension sync secret (recommended once you use the extension)

The browser extension talks to two of your app's API routes
(`/api/session-state`, `/api/schoology-sync`) which have no other auth —
anyone with your app's URL could otherwise poke them.

1. Generate any random string, e.g. `openssl rand -hex 24`.
2. In Vercel, add `EXTENSION_SYNC_SECRET` with that value, redeploy.
3. In the extension's popup (see `extension/README.md`), paste the same
   value into "Extension secret".

### 4. Install the browser extension

See `extension/README.md` — load it unpacked via `chrome://extensions` in
developer mode, then point it at your deployed app URL.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values above
npm run dev
```

## Customizing the music panel

Playlist IDs live in `components/MusicPanel.jsx` (`PLAYLISTS`) — each mode
(`ambient`, `40hz`) is an **array** of playlists, and a random one plays
each time you switch modes. Add more IDs to either array for variety;
right-click a playlist in Spotify → Share → Copy link, take the ID after
`/playlist/`. Playback uses Spotify's iFrame Playback API so the "Start"
button reliably plays audio (browsers block real autoplay without a
genuine click, so there's always one tap to start). Needs you logged
into Spotify in the browser; free accounts get occasional ads.

## Calendar-centric dashboard

The dashboard is built around `components/CalendarPanel.jsx` — a real,
embedded Google Calendar sits at the visual center of the page, with the
timer, sound, sleep, tasks, and messages arranged around it (`.orbit-grid`
in `app/globals.css`; static layout, nothing rotates). Needs the Google
Calendar embed to be visible to you (signed into Google in the browser).

## Sunrise-to-sunset theme

The background blobs and primary button color shift through the day —
sunrise pastels in the morning, warm sunset tones in the afternoon/evening,
calm indigo at night. Driven by `data-time-band` on `<html>` (set in
`app/layout.js` before first paint) and the CSS variables in
`app/globals.css` (`--accent-a`, `--accent-b`, `--blob-1..4` per band).
`lib/timeBand.js` has the same hour bands for any client-side copy (the
dashboard's greeting) — keep both in sync if you ever change the hours.

Sleep, SAT dates, and the college-application countdown all live as real
Supabase `settings` fields (`weekday_bedtime`/`weekend_bedtime`,
`sat_exams`, `college_deadlines`) — bedtime/wake are editable via
dropdowns on the dashboard's Sleep card; SAT dates are read-only display
(edit them directly in Supabase if they change); college deadlines stay
editable in Settings.

## Blocked sites & the study bypass

Blocked sites are fixed to `youtube.com`, `instagram.com`, and
`nytimes.com` during any active session — work or review, weekday or
weekend (no add/remove UI — edit `settings.blocked_sites` directly in
Supabase if you want a different list; see `extension/README.md` to
install the blocker). Only YouTube gets a bypass: the "hold 5s to unlock
YouTube" button lives right on the extension's blocked page
(`extension/blocked.html` / `blocked.js`) — no detour through the
dashboard. Holding it calls `/api/youtube-bypass`, which sets a 90-minute
bypass window (`settings.youtube_bypass_until` in Supabase) that
`/api/session-state` excludes from the blocked list while active, for
when you actually need a YouTube video for studying.

## Automatic Schoology sync

Schoology publishes a private iCal feed of your assignments (Schoology →
Settings → Calendar → **Subscribe**, gives you a `webcal://…/ical.ics`
link) — the app fetches and parses that directly, no login or scraping
needed, so tasks stay in sync with zero manual work.

1. In Schoology, go to **Settings → Calendar → Subscribe** and copy the
   `webcal://` link it gives you.
2. In Vercel, add `SCHOOLOGY_ICS_URL` with that value (paste it exactly
   as `webcal://…` — the app converts it to `https://` itself), then
   redeploy. **Treat this link like a secret** — anyone with it can read
   your assignment calendar — so only ever add it as a Vercel environment
   variable, never commit it to the repo (it's public).
3. `vercel.json` runs `/api/schoology-ics-sync` once a day (Hobby plan
   limit, same as the Gmail sync) — but the dashboard also polls that same
   endpoint every 2 hours on its own, client-side, while a tab is open, so
   new/changed assignments show up same-day without waiting on the cron.
   The cron is what still catches it on a day nobody opens the dashboard.
   Each run:
   - Deletes any *open* Schoology-sourced task that isn't tracked by a
     stable feed ID yet — this is a one-time cleanup the first time it
     runs, clearing out anything from the old manual-paste flow below so
     it doesn't sit there duplicating what the feed now tracks.
   - Upserts every assignment due within the last 2 weeks through the
     next 6 months, keyed by the feed's own event ID — re-running never
     creates duplicates, and it won't touch a task once you've marked it
     done, even if Schoology later changes that assignment's title or
     date.
   - Never deletes a completed task, and never touches a task from
     another source (`manual`, `calendar`).

Recurring assignments aren't expanded (Schoology's feed doesn't use
recurrence for individual assignments, so this hasn't come up) and the
feed itself is Schoology's, not something this app can control the
contents of.

### Manual fallback (no feed URL set up)

If you'd rather not use the feed, two deliberately **unauthenticated**
pages still work as a manual bridge (fine — nobody else knows this URL,
and the blast radius of someone finding it is "fake homework tasks
appear"):

- **https://focuscenter.vercel.app/view** — plain read-only dump
  of every current task, sleep times, SAT dates, and deadlines.
- **https://focuscenter.vercel.app/input** — a form with one
  textarea. Paste one task per line as `Title | YYYY-MM-DD` (date
  optional) and submit. This **replaces** all currently-open
  Schoology-sourced tasks with the pasted list.

Prompt to hand ChatGPT (with browsing/agent capability) for a manual run:

> Log into Schoology and list my current open assignments with their due
> dates. Then go to https://focuscenter.vercel.app/view and check
> what's already listed there, so you don't duplicate anything already
> tracked. Then go to https://focuscenter.vercel.app/input, and in
> the textarea, paste one assignment per line in the format
> `Title | YYYY-MM-DD` (the date is optional if there isn't one), then
> submit the form. This replaces my current open Schoology task list with
> whatever you just pulled, so include everything currently open — don't
> just add new ones.

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
