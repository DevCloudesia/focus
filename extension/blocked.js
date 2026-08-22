// Hold-5s unlock, lives right on the blocked page instead of requiring a
// detour through the dashboard. Same interaction as the app used to have,
// ported to plain JS since this page has no React.

const HOLD_MS = 5000;

const btn = document.getElementById("unlock-btn");
const fill = document.getElementById("unlock-fill");
const label = document.getElementById("unlock-label");
const hint = document.getElementById("hint");
const blockedView = document.getElementById("blocked-view");
const unlockedView = document.getElementById("unlocked-view");

let raf = null;
let start = 0;
let holding = false;

function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["appUrl", "extensionSecret"], resolve);
  });
}

async function init() {
  const { appUrl } = await getConfig();
  if (!appUrl) {
    btn.disabled = true;
    label.textContent = "Unlock unavailable";
    hint.textContent = "Set up the extension (click its toolbar icon) to enable this.";
  }
}
init();

function tick() {
  const elapsed = performance.now() - start;
  const pct = Math.min(1, elapsed / HOLD_MS);
  fill.style.transform = `scaleX(${pct})`;
  if (pct >= 1) {
    complete();
    return;
  }
  raf = requestAnimationFrame(tick);
}

function beginHold(e) {
  e.preventDefault();
  if (btn.disabled || holding) return;
  holding = true;
  label.textContent = "Keep holding…";
  fill.style.transitionDuration = "0ms";
  start = performance.now();
  raf = requestAnimationFrame(tick);
}

function cancelHold() {
  if (!holding) return;
  holding = false;
  label.textContent = "Hold 5s to Unlock YouTube (Study Only)";
  fill.style.transitionDuration = "150ms";
  fill.style.transform = "scaleX(0)";
  if (raf) cancelAnimationFrame(raf);
}

async function complete() {
  holding = false;
  if (raf) cancelAnimationFrame(raf);
  label.textContent = "Unlocking…";
  btn.disabled = true;
  hint.textContent = "";

  const { appUrl, extensionSecret } = await getConfig();
  const headers = { "Content-Type": "application/json" };
  if (extensionSecret) headers["x-extension-secret"] = extensionSecret;

  try {
    const res = await fetch(`${appUrl.replace(/\/$/, "")}/api/youtube-bypass`, {
      method: "POST",
      headers,
    });
    if (!res.ok) throw new Error("request failed");

    // Ask the background worker to rebuild its block rules right now,
    // instead of waiting for the next ~20s poll.
    chrome.runtime.sendMessage({ type: "FORCE_TICK" }, () => {
      blockedView.style.display = "none";
      unlockedView.style.display = "flex";
    });
  } catch {
    label.textContent = "Hold 5s to Unlock YouTube (Study Only)";
    hint.textContent = "Couldn't reach the app — check your connection and try again.";
    btn.disabled = false;
  }
}

btn.addEventListener("pointerdown", beginHold);
btn.addEventListener("pointerup", cancelHold);
btn.addEventListener("pointerleave", cancelHold);
