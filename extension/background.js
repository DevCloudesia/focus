// Polls the focus app's /api/session-state every ~20s. When a work
// session is actively running (not "review" — weekends default to review,
// so this naturally loosens up there per the app's rules), it installs
// declarativeNetRequest rules that redirect the configured blocked sites
// to blocked.html. Rules are torn down the moment the session isn't active.

const RULE_ID_BASE = 1000;

async function getConfig() {
  const { appUrl, extensionSecret } = await chrome.storage.sync.get([
    "appUrl",
    "extensionSecret",
  ]);
  return { appUrl, extensionSecret };
}

async function fetchState() {
  const { appUrl, extensionSecret } = await getConfig();
  if (!appUrl) return null;

  const headers = {};
  if (extensionSecret) headers["x-extension-secret"] = extensionSecret;

  try {
    const res = await fetch(`${appUrl.replace(/\/$/, "")}/api/session-state`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function applyRules(state) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existing.map((r) => r.id);
  if (existingIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: existingIds });
  }

  const shouldBlock = state && state.active && state.session_type === "work";
  if (!shouldBlock || !state.blocked_sites?.length) return;

  const redirectUrl = chrome.runtime.getURL("blocked.html");
  const rules = state.blocked_sites.slice(0, 100).map((domain, i) => ({
    id: RULE_ID_BASE + i,
    priority: 1,
    action: { type: "redirect", redirect: { url: redirectUrl } },
    condition: {
      urlFilter: `||${domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`,
      resourceTypes: ["main_frame"],
    },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({ addRules: rules });
}

async function tick() {
  const state = await fetchState();
  await applyRules(state);
}

chrome.alarms.create("poll-session-state", { periodInMinutes: 0.33 }); // ~20s
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "poll-session-state") tick();
});
chrome.runtime.onStartup.addListener(tick);
chrome.runtime.onInstalled.addListener(tick);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "SCHOOLOGY_SYNC") return;

  (async () => {
    const { appUrl, extensionSecret } = await getConfig();
    if (!appUrl) {
      sendResponse({ ok: false, error: "No app URL configured" });
      return;
    }
    const headers = { "Content-Type": "application/json" };
    if (extensionSecret) headers["x-extension-secret"] = extensionSecret;

    try {
      const res = await fetch(`${appUrl.replace(/\/$/, "")}/api/schoology-sync`, {
        method: "POST",
        headers,
        body: JSON.stringify({ items: message.items }),
      });
      const data = await res.json();
      sendResponse({ ok: res.ok, inserted: data.inserted, error: data.error });
    } catch (err) {
      sendResponse({ ok: false, error: err.message });
    }
  })();

  return true; // keep the message channel open for the async response
});
