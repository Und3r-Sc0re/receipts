// Content script: watches for text selection on any page, shows a floating
// "Check receipts" button, and drives the overlay. All network calls go through
// the background service worker (keeps the API call off the page's origin).

import {
  mountButton,
  hideButton,
  openPanelLoading,
  openPanelResult,
  openPanelError,
} from "./overlay";
import { MAX_CLAIM_CHARS } from "./config";
import type { AnalyzeResponse, TriggerMessage } from "./types";

let lastText = "";

function currentSelectionText(): string {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return "";
  return sel.toString().trim();
}

function selectionRect(): DOMRect | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const rect = sel.getRangeAt(sel.rangeCount - 1).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return rect;
}

function onSelectionChange(): void {
  const text = currentSelectionText();
  if (!text) {
    hideButton();
    lastText = "";
    return;
  }
  const rect = selectionRect();
  if (!rect) return;
  lastText = text.slice(0, MAX_CLAIM_CHARS);
  mountButton(rect.right, rect.bottom, () => runAnalyze(lastText));
}

async function runAnalyze(rawText: string): Promise<void> {
  const text = rawText.trim().slice(0, MAX_CLAIM_CHARS);
  if (!text) return;
  hideButton();
  openPanelLoading();

  try {
    const res: AnalyzeResponse = await chrome.runtime.sendMessage({
      type: "analyze",
      text,
      url: location.href,
    });
    if (res && res.ok) {
      openPanelResult(res.result, res.mock);
    } else {
      openPanelError(
        (res && !res.ok && res.error) ||
          "Could not reach the analysis engine. Is the API running?",
      );
    }
  } catch {
    openPanelError(
      "Could not reach the analysis engine. Check the extension's API URL and that the server is running.",
    );
  }
}

// Debounce selection handling so it fires after the user finishes selecting.
let raf = 0;
document.addEventListener("selectionchange", () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(onSelectionChange);
});

// Context-menu entry point (right-click → "Check receipts on selection").
chrome.runtime.onMessage.addListener((msg: TriggerMessage) => {
  if (msg && msg.type === "trigger" && msg.text) {
    runAnalyze(msg.text);
  }
});
