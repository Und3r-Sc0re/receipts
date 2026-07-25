// Vanilla DOM renderer for an AnalyzeResult. Mirrors web/components/ReceiptResult.
// All model-supplied text goes through textContent (never innerHTML) to prevent
// injection from page content or model output. Class names are styled by the
// stylesheet injected into the shadow root (see overlay.ts).

import type { AnalyzeResult } from "./types";

const SEGMENT_COLORS = [
  "var(--s-1)",
  "var(--s-2)",
  "var(--s-3)",
  "var(--s-4)",
  "var(--s-5)",
];

function el(
  tag: string,
  className?: string,
  text?: string,
): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function rule(): HTMLElement {
  return el("div", "rcp-rule");
}

function section(label: string): HTMLElement {
  const s = el("section", "rcp-section");
  s.appendChild(el("h3", "rcp-label", label));
  return s;
}

export function renderReceipt(result: AnalyzeResult, mock: boolean): HTMLElement {
  const root = el("div", "rcp-body");

  if (mock) {
    const banner = el(
      "div",
      "rcp-mock",
      "Sample mode: no model key connected yet. This shows the real layout; add an NVIDIA API key for live analysis.",
    );
    root.appendChild(banner);
  }

  // Header
  const header = el("div", "rcp-header");
  header.appendChild(el("span", "rcp-wordmark", "RECEIPTS"));
  const stamp = new Date().toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  header.appendChild(el("span", "rcp-stamp", stamp));
  root.appendChild(header);
  root.appendChild(rule());

  // Claim
  const claimSec = section("Claim, restated");
  claimSec.appendChild(el("p", "rcp-claim", `“${result.claim}”`));
  claimSec.appendChild(el("span", "rcp-badge", result.claim_type));
  root.appendChild(claimSec);
  root.appendChild(rule());

  // Support meter
  const supportSec = section("Support");
  const meterHead = el("div", "rcp-meter-head");
  meterHead.appendChild(el("span", "rcp-meter-caption", "Support strength"));
  const color = SEGMENT_COLORS[result.support_level - 1] ?? "var(--s-3)";
  const meterVal = el(
    "span",
    "rcp-meter-val",
    `${result.support_label} · ${result.support_level}/5`,
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
    el("p", "rcp-hint", "How well-evidenced the claim is as written, not a truth verdict."),
  );
  root.appendChild(supportSec);
  root.appendChild(rule());

  // Reasoning
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

  // Red flags
  const flagSec = section("Red flags");
  if (result.red_flags.length === 0) {
    flagSec.appendChild(
      el("p", "rcp-none", "No major reasoning gaps found in how this is stated."),
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

  // What's missing
  if (result.whats_missing.length > 0) {
    root.appendChild(rule());
    const missSec = section("What's missing");
    const ul = el("ul", "rcp-list");
    result.whats_missing.forEach((m) => {
      const li = el("li", "rcp-list-item");
      li.appendChild(el("span", "rcp-dash"));
      li.appendChild(el("span", undefined, m));
      ul.appendChild(li);
    });
    missSec.appendChild(ul);
    root.appendChild(missSec);
  }

  // Search queries
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
      a.appendChild(el("span", undefined, q));
      a.appendChild(el("span", "rcp-arrow", "↗"));
      wrap.appendChild(a);
    });
    searchSec.appendChild(wrap);
    root.appendChild(searchSec);
  }

  // Steelman
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
      "Receipts is a reasoning aid, not a verdict. It shows how well-supported a claim is and points you to evidence. It does not decide what is true.",
    ),
  );

  return root;
}
