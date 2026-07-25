// Background service worker: owns the network call to the Receipts API and the
// right-click context menu. Doing the fetch here (not in the content script)
// keeps the request off the host page's origin and its CSP.

import { ANALYZE_ENDPOINT } from "./config";
import type { AnalyzeMessage, AnalyzeResponse } from "./types";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "receipts-check",
    title: "Check receipts on selection",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "receipts-check" && info.selectionText && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "trigger",
      text: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener(
  (msg: AnalyzeMessage, _sender, sendResponse) => {
    if (msg?.type !== "analyze") return;

    (async () => {
      try {
        const res = await fetch(ANALYZE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: msg.text, sourceUrl: msg.url }),
        });
        const data = await res.json();
        if (!res.ok) {
          sendResponse({ ok: false, error: data.error ?? "Request failed." } as AnalyzeResponse);
          return;
        }
        sendResponse({ ok: true, result: data.result, mock: Boolean(data.mock) } as AnalyzeResponse);
      } catch {
        sendResponse({ ok: false, error: "Network error reaching the API." } as AnalyzeResponse);
      }
    })();

    return true; // keep the message channel open for the async response
  },
);
