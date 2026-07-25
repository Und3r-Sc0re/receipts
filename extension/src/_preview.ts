// Dev-only: renders the overlay panel standalone (no Chrome APIs) so the
// extension UI can be visually verified in a normal browser. Not shipped.
import { openPanelResult } from "./overlay";
import type { AnalyzeResult } from "./types";

const sample: AnalyzeResult = {
  claim: "Higher ice cream sales cause higher crime, based on the two rising together.",
  claim_type: "causal",
  support_level: 1,
  support_label: "unsupported",
  reasoning: [
    "The claim observes that ice cream sales and crime rise together.",
    "It then jumps to saying one causes the other.",
    "A shared cause, hot weather, raises both, explaining the pattern with no link between them.",
  ],
  red_flags: [
    { type: "correlation-vs-causation", note: "Two things rising together does not mean one causes the other." },
    { type: "overgeneralization", note: "A single correlation is treated as a general causal law." },
  ],
  whats_missing: [
    "A study that controls for temperature and season",
    "Any plausible mechanism by which ice cream could cause crime",
  ],
  search_queries: [
    "correlation vs causation summer crime rates confounder",
    "how temperature affects crime statistics",
  ],
  steelman: "The honest version is that a third factor, warm weather, likely drives both, a useful reminder to look for confounders.",
  confidence_note: "This is a textbook confounding pattern.",
};

openPanelResult(sample, true);
