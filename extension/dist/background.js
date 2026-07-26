// src/config.ts
var API_BASE = "https://receiptscheck.vercel.app";
var ANALYZE_ENDPOINT = `${API_BASE}/api/analyze`;

// src/background.ts
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "receipts-check",
    title: "Check receipts on selection",
    contexts: ["selection"]
  });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "receipts-check" && info.selectionText && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "trigger",
      text: info.selectionText
    });
  }
});
chrome.runtime.onMessage.addListener(
  (msg, _sender, sendResponse) => {
    if (msg?.type !== "analyze") return;
    (async () => {
      try {
        const res = await fetch(ANALYZE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: msg.text, sourceUrl: msg.url })
        });
        const data = await res.json();
        if (!res.ok) {
          sendResponse({ ok: false, error: data.error ?? "Request failed." });
          return;
        }
        sendResponse({ ok: true, result: data.result, mock: Boolean(data.mock) });
      } catch {
        sendResponse({ ok: false, error: "Network error reaching the API." });
      }
    })();
    return true;
  }
);
