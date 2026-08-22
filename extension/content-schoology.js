// Runs on Schoology pages. Scrapes visible assignment-like items from the
// current page (works best on the "Upcoming" / course assignments views)
// and exposes a small floating button to send them to the focus app.
//
// Schoology's DOM changes over time and across district instances, so this
// is intentionally generic: it looks for common assignment-list patterns
// rather than one fixed selector. Adjust SELECTORS below if your district's
// Schoology theme differs — right-click an assignment title -> Inspect to
// find the right selector.

const SELECTORS = [
  ".upcoming-assignment-title",
  ".assignment-title",
  "[data-assignment-title]",
  ".item-title a",
];

function scrapeAssignments() {
  const seen = new Set();
  const items = [];

  for (const selector of SELECTORS) {
    document.querySelectorAll(selector).forEach((el) => {
      const title = el.textContent.trim();
      if (!title || seen.has(title)) return;
      seen.add(title);

      const container = el.closest("li, tr, .item, .assignment") || el;
      const dueText = container.querySelector(
        ".due-date, .assignment-due, time, .s-due-date"
      )?.textContent?.trim();

      items.push({ title, notes: dueText ? `Due: ${dueText}` : null });
    });
  }
  return items;
}

function addSyncButton() {
  if (document.getElementById("focus-app-sync-btn")) return;
  const btn = document.createElement("button");
  btn.id = "focus-app-sync-btn";
  btn.textContent = "Sync to Focus App";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 999999,
    background: "#ff8b5e",
    color: "#0a0e14",
    border: "none",
    borderRadius: "999px",
    padding: "12px 20px",
    fontWeight: "600",
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
  });

  btn.onclick = async () => {
    const items = scrapeAssignments();
    btn.textContent = `Found ${items.length}, syncing…`;
    chrome.runtime.sendMessage({ type: "SCHOOLOGY_SYNC", items }, (response) => {
      btn.textContent = response?.ok
        ? `Synced ${response.inserted ?? items.length}`
        : "Sync failed — check extension settings";
      setTimeout(() => (btn.textContent = "Sync to Focus App"), 3000);
    });
  };

  document.body.appendChild(btn);
}

addSyncButton();
