"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  MagnifyingGlass,
  ArrowUpRight,
  Info,
} from "@phosphor-icons/react/dist/ssr";
import type { AnalyzeResult } from "@/lib/analyze-schema";
import { SupportMeter } from "./SupportMeter";
import { ReasoningSteps } from "./ReasoningSteps";
import { RedFlagList } from "./RedFlag";
import { Disclaimer } from "./Disclaimer";

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
        {label}
      </h3>
      {children}
    </section>
  );
}

function Rule() {
  return <div className="receipt-rule my-6" />;
}

export function ReceiptResult({
  result,
  mock,
  sourceLabel,
}: {
  result: AnalyzeResult;
  mock: boolean;
  sourceLabel: string;
}) {
  const reduce = useReducedMotion();
  const stamp = new Date().toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[640px]"
    >
      <div className="perf-edge" />
      <div className="border-x border-[color:var(--color-line)] bg-elev px-6 py-6 sm:px-8">
        {mock && (
          <div className="mb-6 flex items-start gap-2 rounded-md border border-[color:var(--color-accent)]/30 bg-accent-soft px-3 py-2 text-[12px] leading-relaxed text-accent">
            <Info size={16} weight="fill" className="mt-[1px] shrink-0" />
            <span>
              Sample mode: no model key connected yet. This shows the real
              layout; add an NVIDIA API key for live, per-claim analysis.
            </span>
          </div>
        )}

        {/* Receipt header */}
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-[15px] font-bold uppercase tracking-[0.25em] text-ink">
            Receipts
          </span>
          <span className="font-mono text-[11px] text-faint">{stamp}</span>
        </div>
        <p className="mt-1 truncate font-mono text-[11px] text-faint">
          src: {sourceLabel}
        </p>

        <Rule />

        {/* The claim */}
        <Section label="Claim, restated">
          <p className="text-[17px] leading-relaxed text-ink">
            &ldquo;{result.claim}&rdquo;
          </p>
          <span className="mt-3 inline-block rounded-full border border-[color:var(--color-line)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
            {result.claim_type}
          </span>
        </Section>

        <Rule />

        <Section label="Support">
          <SupportMeter level={result.support_level} label={result.support_label} />
        </Section>

        <Rule />

        <Section label="Reasoning, step by step">
          <ReasoningSteps steps={result.reasoning} />
        </Section>

        <Rule />

        <Section label="Red flags">
          <RedFlagList flags={result.red_flags} />
        </Section>

        {result.whats_missing.length > 0 && (
          <>
            <Rule />
            <Section label="What's missing">
              <ul className="grid gap-2">
                {result.whats_missing.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/90">
                    <span className="mt-[9px] h-px w-3 shrink-0 bg-[color:var(--color-faint)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}

        {result.search_queries.length > 0 && (
          <>
            <Rule />
            <Section label="Check it yourself">
              <div className="grid gap-2">
                {result.search_queries.map((q, i) => (
                  <a
                    key={i}
                    href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-md border border-[color:var(--color-line)] bg-elev2/50 px-3 py-2.5 text-[14px] text-ink/90 transition-colors hover:border-[color:var(--color-accent)]/40 hover:bg-accent-soft"
                  >
                    <span className="flex items-center gap-2.5">
                      <MagnifyingGlass size={15} className="text-faint group-hover:text-accent" />
                      {q}
                    </span>
                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-faint transition-colors group-hover:text-accent"
                    />
                  </a>
                ))}
              </div>
            </Section>
          </>
        )}

        <Rule />

        <Section label="Strongest opposing view">
          <p className="border-l-2 border-[color:var(--color-accent)]/50 pl-4 text-[14px] italic leading-relaxed text-dim">
            {result.steelman}
          </p>
        </Section>

        {result.confidence_note && (
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-faint">
            note: {result.confidence_note}
          </p>
        )}

        <Rule />

        <Disclaimer />
      </div>
      <div className="perf-edge perf-edge--bottom" />
    </motion.div>
  );
}
