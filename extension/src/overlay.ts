// Shadow-DOM UI: a floating "Check receipts" button and a result panel.
// Everything lives inside a single shadow root so page CSS can't break our
// styles and ours can't leak onto the page.

import type { AnalyzeResult } from "./types";
import { renderReceipt } from "./render";

let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let button: HTMLButtonElement | null = null;
let panel: HTMLDivElement | null = null;

const STYLES = `
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

function ensureHost(): ShadowRoot {
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

function scopeEl(): HTMLElement {
  ensureHost();
  return shadow!.querySelector(".rcp-scope") as HTMLElement;
}

export function mountButton(x: number, y: number, onClick: () => void): void {
  const scope = scopeEl();
  hideButton();
  button = document.createElement("button");
  button.className = "rcp-btn";
  button.textContent = "⧉ Check receipts";
  // Clamp within viewport.
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

export function hideButton(): void {
  if (button) {
    button.remove();
    button = null;
  }
}

function openPanel(inner: HTMLElement): void {
  const scope = scopeEl();
  closePanel();
  panel = document.createElement("div");
  panel.className = "rcp-panel";

  const close = document.createElement("button");
  close.className = "rcp-close";
  close.textContent = "✕";
  close.setAttribute("aria-label", "Close");
  close.addEventListener("click", closePanel);
  panel.appendChild(close);

  panel.appendChild(inner);
  scope.appendChild(panel);

  document.addEventListener("keydown", onKeydown, true);
  setTimeout(() => document.addEventListener("mousedown", onOutside, true), 0);
}

export function openPanelLoading(): void {
  const wrap = document.createElement("div");
  wrap.className = "rcp-body";
  const head = document.createElement("div");
  head.className = "rcp-header";
  const wm = document.createElement("span");
  wm.className = "rcp-wordmark";
  wm.textContent = "RECEIPTS";
  const st = document.createElement("span");
  st.className = "rcp-stamp";
  st.textContent = "reading…";
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

export function openPanelResult(result: AnalyzeResult, mock: boolean): void {
  openPanel(renderReceipt(result, mock));
}

export function openPanelError(message: string): void {
  const wrap = document.createElement("div");
  wrap.className = "rcp-body";
  const err = document.createElement("p");
  err.className = "rcp-error";
  err.textContent = message;
  wrap.appendChild(err);
  openPanel(wrap);
}

export function closePanel(): void {
  if (panel) {
    panel.remove();
    panel = null;
  }
  document.removeEventListener("keydown", onKeydown, true);
  document.removeEventListener("mousedown", onOutside, true);
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") closePanel();
}

function onOutside(e: MouseEvent): void {
  if (!host) return;
  if (!e.composedPath().includes(host)) closePanel();
}
