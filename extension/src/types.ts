// KEEP IN SYNC with web/lib/analyze-schema.ts

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

export type RedFlag = { type: string; note: string };

export type AnalyzeResult = {
  claim: string;
  claim_type: ClaimType;
  support_level: 1 | 2 | 3 | 4 | 5;
  support_label: SupportLabel;
  reasoning: string[];
  red_flags: RedFlag[];
  whats_missing: string[];
  search_queries: string[];
  steelman: string;
  confidence_note: string;
};

// Messages between content script and background service worker.
export type AnalyzeMessage = {
  type: "analyze";
  text: string;
  url?: string;
};

export type TriggerMessage = {
  type: "trigger";
  text: string;
};

export type AnalyzeResponse =
  | { ok: true; result: AnalyzeResult; mock: boolean }
  | { ok: false; error: string };
