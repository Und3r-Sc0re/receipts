import type { AnalyzeResult } from "./analyze-schema";

// Each example doubles as (1) a one-click demo chip and (2) the response the
// API returns in mock mode (when no NVIDIA_API_KEY is set), so the product is
// fully demoable before the key is wired in. With a key set, real model output
// replaces these.

export type Example = {
  label: string;
  text: string;
  mock: AnalyzeResult;
};

export const EXAMPLES: Example[] = [
  {
    label: "Supplement claim",
    text: "This supplement boosted energy by 40% in our study.",
    mock: {
      claim: "A supplement increased energy by 40% in a study run by its seller.",
      claim_type: "statistical",
      support_level: 2,
      support_label: "weak",
      reasoning: [
        "The claim reports a precise number, 40%, but never says 40% compared to what.",
        "The study is described as 'our study', so the seller both ran it and profits from the result.",
        "'Energy' is never defined or measured in any stated way, so the 40% could mean almost anything.",
      ],
      red_flags: [
        { type: "missing-baseline", note: "40% higher than what? No comparison group or starting point is given." },
        { type: "unnamed-source", note: "The study is self-run and unnamed, so it cannot be independently checked." },
        { type: "vague-quantifier", note: "'Energy' has no defined measurement, which makes the percentage hard to interpret." },
      ],
      whats_missing: [
        "An independent, published study with a control group",
        "A clear definition of how 'energy' was measured",
        "Sample size and whether the result was statistically significant",
      ],
      search_queries: [
        "independent randomized trial supplement energy control group",
        "how to spot missing baseline in health claims",
      ],
      steelman: "If a properly controlled independent trial measured a defined energy marker and still found a 40% improvement, the claim would become well-supported.",
      confidence_note: "I can only judge the claim as written; I have no access to the underlying study.",
    },
  },
  {
    label: "Ice cream & crime",
    text: "Cities with more ice cream sales have more crime, so ice cream drives crime.",
    mock: {
      claim: "Higher ice cream sales cause higher crime, based on the two rising together.",
      claim_type: "causal",
      support_level: 1,
      support_label: "unsupported",
      reasoning: [
        "The claim observes that ice cream sales and crime rise together.",
        "It then jumps to saying one causes the other.",
        "A shared cause, hot weather, raises both ice cream sales and time spent outdoors, explaining the pattern with no link between them.",
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
      steelman: "The honest version is that a third factor, warm weather, likely drives both, which is a useful reminder to look for confounders rather than evidence that ice cream causes crime.",
      confidence_note: "This is a textbook confounding pattern, though I cannot rule out other issues in the original data.",
    },
  },
  {
    label: "“Most experts agree”",
    text: "Most experts agree this is the healthiest diet.",
    mock: {
      claim: "A majority of experts consider this diet the healthiest.",
      claim_type: "opinion",
      support_level: 2,
      support_label: "weak",
      reasoning: [
        "The claim leans entirely on 'most experts' without naming any or citing a survey.",
        "'Healthiest' is not defined; healthiest for weight, heart health, and longevity can point to different diets.",
        "Nutrition consensus is genuinely contested, so a blanket 'most agree' papers over real disagreement.",
      ],
      red_flags: [
        { type: "vague-quantifier", note: "'Most experts' gives no number, field, or source to check." },
        { type: "appeal-to-authority", note: "It asks you to trust unnamed authorities instead of evidence." },
        { type: "unnamed-source", note: "No specific experts, study, or survey is identified." },
      ],
      whats_missing: [
        "A named survey or consensus statement from a recognized body",
        "A clear definition of what 'healthiest' is being measured against",
      ],
      search_queries: [
        "dietary guidelines consensus healthiest diet major health organizations",
        "expert survey diet rankings methodology",
      ],
      steelman: "If a large survey of registered dietitians using a defined health outcome did rank this diet first, the claim would have real backing.",
      confidence_note: "I am judging the phrasing, not the diet itself, which may still be healthy on some measures.",
    },
  },
  {
    label: "AI & jobs",
    text: "AI will take half of all jobs within five years.",
    mock: {
      claim: "Artificial intelligence will eliminate 50% of all jobs within five years.",
      claim_type: "prediction",
      support_level: 2,
      support_label: "weak",
      reasoning: [
        "This is a prediction about the future, so it cannot be verified today, only assessed for plausibility.",
        "'Take' is ambiguous: fully replaced, partly automated, or changed? Each gives a very different number.",
        "The specific figure, half of all jobs in five years, is far more aggressive than most published labor forecasts.",
      ],
      red_flags: [
        { type: "unfalsifiable", note: "As stated it can't be tested until the five years pass, and 'take' is left undefined." },
        { type: "vague-quantifier", note: "'Half of all jobs' and 'take' are not precisely defined." },
        { type: "overgeneralization", note: "A single sweeping figure is applied to every job and industry at once." },
      ],
      whats_missing: [
        "A definition of what counts as a job being 'taken'",
        "The forecasting method or economic model behind the number",
        "How it compares to mainstream labor-market projections",
      ],
      search_queries: [
        "labor economists forecast AI job displacement next five years",
        "AI automation share of tasks vs whole jobs report",
      ],
      steelman: "A more careful version, that AI will automate a large share of tasks within many jobs over the next decade, is taken seriously by several economists and is more defensible than the headline figure.",
      confidence_note: "Predictions can't be verified in advance; I'm assessing how well-specified and plausible this one is.",
    },
  },
];

export function findMockByText(text: string): AnalyzeResult {
  const match = EXAMPLES.find((e) => e.text.trim() === text.trim());
  if (match) return match.mock;
  return genericMock(text);
}

function genericMock(text: string): AnalyzeResult {
  const claim = text.length > 160 ? text.slice(0, 157) + "..." : text;
  return {
    claim,
    claim_type: "mixed",
    support_level: 3,
    support_label: "mixed",
    reasoning: [
      "This is a sample analysis (the live model is not connected yet).",
      "Add an NVIDIA_API_KEY to the server to see a real, claim-specific breakdown.",
      "The structure below shows exactly what a live result looks like.",
    ],
    red_flags: [
      { type: "vague-quantifier", note: "Sample flag: without the live model, specific weaknesses can't be detected." },
    ],
    whats_missing: [
      "A connected NVIDIA_API_KEY for live analysis",
      "The primary source behind the claim",
    ],
    search_queries: [
      "how to fact-check a claim primary source",
      "evaluate evidence quality of a statistic",
    ],
    steelman: "In sample mode, Receipts shows its full layout so you can see how it reasons; connect the model for real per-claim analysis.",
    confidence_note: "This is placeholder output shown only while no model key is configured.",
  };
}
