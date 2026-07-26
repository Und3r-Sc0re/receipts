// src/render.ts
var SEGMENT_COLORS = [
  "var(--s-1)",
  "var(--s-2)",
  "var(--s-3)",
  "var(--s-4)",
  "var(--s-5)"
];
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== void 0) node.textContent = text;
  return node;
}
function rule() {
  return el("div", "rcp-rule");
}
function section(label) {
  const s = el("section", "rcp-section");
  s.appendChild(el("h3", "rcp-label", label));
  return s;
}
function renderReceipt(result, mock) {
  const root = el("div", "rcp-body");
  if (mock) {
    const banner = el(
      "div",
      "rcp-mock",
      "Sample mode: no model key connected yet. This shows the real layout; add an NVIDIA API key for live analysis."
    );
    root.appendChild(banner);
  }
  const header = el("div", "rcp-header");
  header.appendChild(el("span", "rcp-wordmark", "RECEIPTS"));
  const stamp = (/* @__PURE__ */ new Date()).toLocaleString(void 0, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  header.appendChild(el("span", "rcp-stamp", stamp));
  root.appendChild(header);
  root.appendChild(rule());
  const claimSec = section("Claim, restated");
  claimSec.appendChild(el("p", "rcp-claim", `\u201C${result.claim}\u201D`));
  claimSec.appendChild(el("span", "rcp-badge", result.claim_type));
  root.appendChild(claimSec);
  root.appendChild(rule());
  const supportSec = section("Support");
  const meterHead = el("div", "rcp-meter-head");
  meterHead.appendChild(el("span", "rcp-meter-caption", "Support strength"));
  const color = SEGMENT_COLORS[result.support_level - 1] ?? "var(--s-3)";
  const meterVal = el(
    "span",
    "rcp-meter-val",
    `${result.support_label} \xB7 ${result.support_level}/5`
  );
  meterVal.style.color = color;
  meterHead.appendChild(meterVal);
  supportSec.appendChild(meterHead);
  const meter = el("div", "rcp-meter");
  for (let i = 0; i < 5; i++) {
    const seg = el("div", "rcp-seg");
    seg.style.backgroundColor = i < result.support_level ? color : "var(--elev2)";
    meter.appendChild(seg);
  }
  supportSec.appendChild(meter);
  supportSec.appendChild(
    el("p", "rcp-hint", "How well-evidenced the claim is as written, not a truth verdict.")
  );
  root.appendChild(supportSec);
  root.appendChild(rule());
  const reasonSec = section("Reasoning, step by step");
  const ol = el("ol", "rcp-steps");
  result.reasoning.forEach((step, i) => {
    const li = el("li", "rcp-step");
    li.appendChild(el("span", "rcp-step-num", String(i + 1)));
    li.appendChild(el("p", "rcp-step-text", step));
    ol.appendChild(li);
  });
  reasonSec.appendChild(ol);
  root.appendChild(reasonSec);
  root.appendChild(rule());
  const flagSec = section("Red flags");
  if (result.red_flags.length === 0) {
    flagSec.appendChild(
      el("p", "rcp-none", "No major reasoning gaps found in how this is stated.")
    );
  } else {
    const list = el("ul", "rcp-flags");
    result.red_flags.forEach((flag) => {
      const item = el("li", "rcp-flag");
      item.appendChild(el("span", "rcp-flag-type", flag.type.replace(/-/g, " ")));
      item.appendChild(el("p", "rcp-flag-note", flag.note));
      list.appendChild(item);
    });
    flagSec.appendChild(list);
  }
  root.appendChild(flagSec);
  if (result.whats_missing.length > 0) {
    root.appendChild(rule());
    const missSec = section("What's missing");
    const ul = el("ul", "rcp-list");
    result.whats_missing.forEach((m) => {
      const li = el("li", "rcp-list-item");
      li.appendChild(el("span", "rcp-dash"));
      li.appendChild(el("span", void 0, m));
      ul.appendChild(li);
    });
    missSec.appendChild(ul);
    root.appendChild(missSec);
  }
  if (result.search_queries.length > 0) {
    root.appendChild(rule());
    const searchSec = section("Check it yourself");
    const wrap = el("div", "rcp-queries");
    result.search_queries.forEach((q) => {
      const a = document.createElement("a");
      a.className = "rcp-query";
      a.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.appendChild(el("span", void 0, q));
      a.appendChild(el("span", "rcp-arrow", "\u2197"));
      wrap.appendChild(a);
    });
    searchSec.appendChild(wrap);
    root.appendChild(searchSec);
  }
  root.appendChild(rule());
  const steelSec = section("Strongest opposing view");
  steelSec.appendChild(el("p", "rcp-steel", result.steelman));
  root.appendChild(steelSec);
  if (result.confidence_note) {
    root.appendChild(el("p", "rcp-note", `note: ${result.confidence_note}`));
  }
  root.appendChild(rule());
  root.appendChild(
    el(
      "p",
      "rcp-disclaimer",
      "Receipts is a reasoning aid, not a verdict. It shows how well-supported a claim is and points you to evidence. It does not decide what is true."
    )
  );
  return root;
}

// src/overlay.ts
var host = null;
var shadow = null;
var button = null;
var panel = null;
var STYLES = `
:host { all: initial; }
* { box-sizing: border-box; }
.rcp-scope {
  --bg: #0b0a09; --elev: #141210; --elev2: #1c1916;
  --ink: #f5f3ef; --dim: #a29c94; --faint: #6b655d;
  --line: rgba(245,243,239,0.10); --accent: #e0a44a; --accent-soft: rgba(224,164,74,0.14);
  --s-1:#d95c4a; --s-2:#dd8a3d; --s-3:#d3b545; --s-4:#86ab57; --s-5:#4fa571;
  --font-sans: 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
  font-family: var(--font-sans);
}

/* Floating button */
.rcp-btn {
  position: fixed; z-index: 2147483646;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px; border: none; border-radius: 9px; cursor: pointer;
  background: var(--accent); color: #1a1408;
  font-family: var(--font-sans); font-size: 13px; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35); transition: filter .15s, transform .1s;
}
.rcp-btn:hover { filter: brightness(1.08); }
.rcp-btn:active { transform: scale(0.97); }

/* Panel */
.rcp-panel {
  position: fixed; top: 20px; right: 20px; z-index: 2147483647;
  width: 380px; max-width: calc(100vw - 40px); max-height: 84vh; overflow-y: auto;
  background: var(--elev); color: var(--ink);
  border: 1px solid var(--line); border-radius: 14px;
  box-shadow: 0 24px 70px rgba(0,0,0,0.55);
  font-family: var(--font-sans);
}
.rcp-panel::-webkit-scrollbar { width: 8px; }
.rcp-panel::-webkit-scrollbar-thumb { background: var(--elev2); border-radius: 8px; }
.rcp-close {
  position: sticky; top: 0; float: right; margin: 10px 10px -30px 0;
  z-index: 2; width: 28px; height: 28px; border-radius: 7px; cursor: pointer;
  border: 1px solid var(--line); background: var(--elev2); color: var(--dim);
  font-size: 15px; line-height: 1; display: flex; align-items: center; justify-content: center;
}
.rcp-close:hover { color: var(--ink); }

.rcp-body { padding: 22px; }
.rcp-mock {
  margin-bottom: 16px; padding: 9px 11px; border-radius: 8px;
  border: 1px solid rgba(224,164,74,0.3); background: var(--accent-soft);
  color: var(--accent); font-size: 12px; line-height: 1.5;
}
.rcp-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.rcp-wordmark { font-family: var(--font-mono); font-size: 14px; font-weight: 700; letter-spacing: 0.22em; }
.rcp-stamp { font-family: var(--font-mono); font-size: 11px; color: var(--faint); }
.rcp-rule {
  height: 1px; margin: 18px 0;
  background-image: linear-gradient(to right, var(--line) 0, var(--line) 6px, transparent 6px, transparent 12px);
  background-size: 12px 1px; background-repeat: repeat-x;
}
.rcp-section { }
.rcp-label {
  margin: 0 0 10px; font-family: var(--font-mono); font-size: 10.5px;
  text-transform: uppercase; letter-spacing: 0.2em; color: var(--faint); font-weight: 400;
}
.rcp-claim { margin: 0; font-size: 16px; line-height: 1.55; color: var(--ink); }
.rcp-badge {
  display: inline-block; margin-top: 10px; padding: 2px 9px; border-radius: 999px;
  border: 1px solid var(--line); font-family: var(--font-mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.14em; color: var(--dim);
}
.rcp-meter-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.rcp-meter-caption { font-family: var(--font-mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.16em; color: var(--faint); }
.rcp-meter-val { font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
.rcp-meter { display: flex; gap: 6px; margin-top: 8px; }
.rcp-seg { height: 10px; flex: 1; border-radius: 2px; }
.rcp-hint { margin: 8px 0 0; font-family: var(--font-mono); font-size: 10.5px; line-height: 1.5; color: var(--faint); }
.rcp-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.rcp-step { display: flex; gap: 11px; }
.rcp-step-num {
  flex: 0 0 auto; width: 20px; height: 20px; margin-top: 2px; border-radius: 999px;
  border: 1px solid rgba(224,164,74,0.4); color: var(--accent);
  font-family: var(--font-mono); font-size: 11px;
  display: flex; align-items: center; justify-content: center;
}
.rcp-step-text { margin: 0; font-size: 14px; line-height: 1.55; color: rgba(245,243,239,0.9); }
.rcp-none { margin: 0; font-family: var(--font-mono); font-size: 13px; color: var(--dim); }
.rcp-flags { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.rcp-flag { padding: 11px; border-radius: 8px; border: 1px solid var(--line); background: rgba(28,25,22,0.6); }
.rcp-flag-type { font-family: var(--font-mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.13em; color: var(--s-2); }
.rcp-flag-note { margin: 6px 0 0; font-size: 13.5px; line-height: 1.5; color: rgba(245,243,239,0.9); }
.rcp-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.rcp-list-item { display: flex; gap: 10px; font-size: 13.5px; line-height: 1.5; color: rgba(245,243,239,0.9); }
.rcp-dash { flex: 0 0 auto; width: 12px; height: 1px; margin-top: 9px; background: var(--faint); }
.rcp-queries { display: grid; gap: 8px; }
.rcp-query {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 11px; border-radius: 8px; border: 1px solid var(--line);
  background: rgba(28,25,22,0.5); color: rgba(245,243,239,0.9);
  font-size: 13.5px; text-decoration: none; transition: border-color .15s, background .15s;
}
.rcp-query:hover { border-color: rgba(224,164,74,0.4); background: var(--accent-soft); }
.rcp-arrow { color: var(--faint); }
.rcp-steel { margin: 0; padding-left: 14px; border-left: 2px solid rgba(224,164,74,0.5); font-size: 13.5px; font-style: italic; line-height: 1.55; color: var(--dim); }
.rcp-note { margin: 14px 0 0; font-family: var(--font-mono); font-size: 10.5px; line-height: 1.5; color: var(--faint); }
.rcp-disclaimer { margin: 0; font-size: 12.5px; line-height: 1.55; color: var(--dim); }

/* Loading skeleton */
.rcp-load { display: grid; gap: 12px; }
.rcp-load-bar { height: 12px; border-radius: 4px; background: var(--elev2); animation: rcp-pulse 1.2s ease-in-out infinite; }
@keyframes rcp-pulse { 0%,100% { opacity: .35; } 50% { opacity: .7; } }
.rcp-error { padding: 4px; font-size: 13.5px; line-height: 1.55; color: var(--dim); }

@media (prefers-reduced-motion: reduce) {
  .rcp-load-bar { animation: none; opacity: .5; }
}
`;
function ensureHost() {
  if (shadow) return shadow;
  host = document.createElement("div");
  host.id = "receipts-host";
  document.documentElement.appendChild(host);
  shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = STYLES;
  shadow.appendChild(style);
  const scope = document.createElement("div");
  scope.className = "rcp-scope";
  shadow.appendChild(scope);
  return shadow;
}
function scopeEl() {
  ensureHost();
  return shadow.querySelector(".rcp-scope");
}
function mountButton(x, y, onClick) {
  const scope = scopeEl();
  hideButton();
  button = document.createElement("button");
  button.className = "rcp-btn";
  button.textContent = "\u29C9 Check receipts";
  const left = Math.min(Math.max(x, 8), window.innerWidth - 150);
  const top = Math.min(Math.max(y + 8, 8), window.innerHeight - 44);
  button.style.left = `${left}px`;
  button.style.top = `${top}px`;
  button.addEventListener("mousedown", (e) => e.preventDefault());
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  scope.appendChild(button);
}
function hideButton() {
  if (button) {
    button.remove();
    button = null;
  }
}
function openPanel(inner) {
  const scope = scopeEl();
  closePanel();
  panel = document.createElement("div");
  panel.className = "rcp-panel";
  const close = document.createElement("button");
  close.className = "rcp-close";
  close.textContent = "\u2715";
  close.setAttribute("aria-label", "Close");
  close.addEventListener("click", closePanel);
  panel.appendChild(close);
  panel.appendChild(inner);
  scope.appendChild(panel);
  document.addEventListener("keydown", onKeydown, true);
  setTimeout(() => document.addEventListener("mousedown", onOutside, true), 0);
}
function openPanelLoading() {
  const wrap = document.createElement("div");
  wrap.className = "rcp-body";
  const head = document.createElement("div");
  head.className = "rcp-header";
  const wm = document.createElement("span");
  wm.className = "rcp-wordmark";
  wm.textContent = "RECEIPTS";
  const st = document.createElement("span");
  st.className = "rcp-stamp";
  st.textContent = "reading\u2026";
  head.append(wm, st);
  wrap.appendChild(head);
  const r = document.createElement("div");
  r.className = "rcp-rule";
  wrap.appendChild(r);
  const load = document.createElement("div");
  load.className = "rcp-load";
  [90, 70, 82, 55, 76, 64].forEach((w) => {
    const bar = document.createElement("div");
    bar.className = "rcp-load-bar";
    bar.style.width = `${w}%`;
    load.appendChild(bar);
  });
  wrap.appendChild(load);
  openPanel(wrap);
}
function openPanelResult(result, mock) {
  openPanel(renderReceipt(result, mock));
}
function openPanelError(message) {
  const wrap = document.createElement("div");
  wrap.className = "rcp-body";
  const err = document.createElement("p");
  err.className = "rcp-error";
  err.textContent = message;
  wrap.appendChild(err);
  openPanel(wrap);
}
function closePanel() {
  if (panel) {
    panel.remove();
    panel = null;
  }
  document.removeEventListener("keydown", onKeydown, true);
  document.removeEventListener("mousedown", onOutside, true);
}
function onKeydown(e) {
  if (e.key === "Escape") closePanel();
}
function onOutside(e) {
  if (!host) return;
  if (!e.composedPath().includes(host)) closePanel();
}

// src/config.ts
var API_BASE = "https://receiptscheck.vercel.app";
var ANALYZE_ENDPOINT = `${API_BASE}/api/analyze`;
var MAX_CLAIM_CHARS = 4e3;

// src/content.ts
var lastText = "";
function currentSelectionText() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return "";
  return sel.toString().trim();
}
function selectionRect() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const rect = sel.getRangeAt(sel.rangeCount - 1).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return rect;
}
function onSelectionChange() {
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
async function runAnalyze(rawText) {
  const text = rawText.trim().slice(0, MAX_CLAIM_CHARS);
  if (!text) return;
  hideButton();
  openPanelLoading();
  try {
    const res = await chrome.runtime.sendMessage({
      type: "analyze",
      text,
      url: location.href
    });
    if (res && res.ok) {
      openPanelResult(res.result, res.mock);
    } else {
      openPanelError(
        res && !res.ok && res.error || "Could not reach the analysis engine. Is the API running?"
      );
    }
  } catch {
    openPanelError(
      "Could not reach the analysis engine. Check the extension's API URL and that the server is running."
    );
  }
}
var raf = 0;
document.addEventListener("selectionchange", () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(onSelectionChange);
});
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "trigger" && msg.text) {
    runAnalyze(msg.text);
  }
});
