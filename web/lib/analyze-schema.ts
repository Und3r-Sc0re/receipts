// KEEP IN SYNC with extension/src/types.ts
// Single source of truth for the Receipts analysis contract.

export type ClaimType =
  | "fact"
  | "opinion"
  | "prediction"
  | "causal"
  | "statistical"
  | "mixed";

export type SupportLabel =
  | "unsupported"
  | "weak"
  | "mixed"
  | "reasonable"
  | "strong";

export type RedFlag = {
  type: string; // taxonomy label, e.g. "correlation-vs-causation"
  note: string; // one plain-language sentence
};

export type AnalyzeResult = {
  claim: string;
  claim_type: ClaimType;
  support_level: 1 | 2 | 3 | 4 | 5; // how well-supported AS STATED — not a truth verdict
  support_label: SupportLabel;
  reasoning: string[]; // 3–5 visible steps
  red_flags: RedFlag[];
  whats_missing: string[];
  search_queries: string[];
  steelman: string;
  confidence_note: string;
};

export type AnalyzeRequest = {
  text: string;
  sourceUrl?: string;
};

export const MAX_CLAIM_CHARS = 4000;

export const SUPPORT_LABELS: Record<number, SupportLabel> = {
  1: "unsupported",
  2: "weak",
  3: "mixed",
  4: "reasonable",
  5: "strong",
};

// The red-flag taxonomy the model is asked to prefer. Used for UI labels too.
export const RED_FLAG_TAXONOMY = [
  "correlation-vs-causation",
  "missing-baseline",
  "cherry-picking",
  "vague-quantifier",
  "unnamed-source",
  "appeal-to-authority",
  "false-dichotomy",
  "outdated-data",
  "overgeneralization",
  "loaded-language",
  "unfalsifiable",
  "survivorship-bias",
] as const;

// Runtime validation + defaulting. Never throws on a well-meaning-but-loose
// model response; fills sane defaults so the UI never crashes.
export function coerceResult(raw: unknown): AnalyzeResult | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const claim = typeof o.claim === "string" ? o.claim.trim() : "";
  if (!claim) return null;

  const level = clampLevel(o.support_level);

  return {
    claim,
    claim_type: coerceClaimType(o.claim_type),
    support_level: level,
    support_label: SUPPORT_LABELS[level],
    reasoning: strArray(o.reasoning).slice(0, 6),
    red_flags: flagArray(o.red_flags),
    whats_missing: strArray(o.whats_missing).slice(0, 6),
    search_queries: strArray(o.search_queries).slice(0, 4),
    steelman: typeof o.steelman === "string" ? o.steelman.trim() : "",
    confidence_note:
      typeof o.confidence_note === "string" ? o.confidence_note.trim() : "",
  };
}

function clampLevel(v: unknown): 1 | 2 | 3 | 4 | 5 {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, n)) as 1 | 2 | 3 | 4 | 5;
}

function coerceClaimType(v: unknown): ClaimType {
  const allowed: ClaimType[] = [
    "fact",
    "opinion",
    "prediction",
    "causal",
    "statistical",
    "mixed",
  ];
  return allowed.includes(v as ClaimType) ? (v as ClaimType) : "mixed";
}

function strArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && x.trim()).map((x) => (x as string).trim());
}

function flagArray(v: unknown): RedFlag[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === "object")
    .map((x) => {
      const f = x as Record<string, unknown>;
      return {
        type: typeof f.type === "string" ? f.type.trim() : "reasoning-gap",
        note: typeof f.note === "string" ? f.note.trim() : "",
      };
    })
    .filter((f) => f.note)
    .slice(0, 8);
}
