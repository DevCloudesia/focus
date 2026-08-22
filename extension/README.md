# Focus Workspace Companion (browser extension)

Three jobs:

1. **Site blocking** — while an active *work* session is running in your
   focus app (weekends default to review sessions, which this leaves
   unblocked, per how the app's weekend mode works), it redirects any
   domain in your Settings → Blocked sites list (fixed to just
   `youtube.com`) to a small "you're focused" page.
2. **The study bypass, right on the blocked page** — that page has its own
   "hold 5s to unlock YouTube" button. Holding it calls the app's
   `/api/youtube-bypass` directly, opens a 90-minute window, and tells the
   background worker to rebuild its rules immediately (not on the next
   ~20s poll), then hands you a link to YouTube. No detour through the
   dashboard needed.
3. **Schoology sync** — on any `schoology.com` page, adds a floating
   "Sync to Focus App" button that scrapes visible assignment titles/due
   dates and posts them into your task list.

## Install (Chrome/Edge, developer mode)

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Click the extension's icon in the toolbar, enter:
   - **App URL**: your deployed app, e.g. `https://focus-yourname.vercel.app`
   - **Extension secret**: only needed if you set `EXTENSION_SYNC_SECRET`
     in the app's environment variables (recommended — otherwise anyone
     who finds your app URL could post fake tasks or read session state).
5. Click **Save**.

## Notes

- Blocking uses Manifest V3's `declarativeNetRequest` — no page content is
  ever read for this part, only the current session state from your own
  app's `/api/session-state` endpoint.
- Schoology's page structure varies by district/theme. If the sync button
  finds 0 assignments, open `content-schoology.js`, right-click an
  assignment title on your Schoology page → Inspect, and add the matching
  CSS selector to the `SELECTORS` list near the top of the file.
- The blocklist itself lives in the app (Settings → Blocked sites), not in
  the extension, so you only ever edit it in one place.
