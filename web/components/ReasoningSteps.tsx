"use client";

import { motion, useReducedMotion } from "motion/react";

// The visible reasoning chain — the centerpiece. Steps stagger in so it reads
// like the analysis thinking on the page.
export function ReasoningSteps({ steps }: { steps: string[] }) {
  const reduce = useReducedMotion();

  return (
    <ol className="relative grid gap-4">
      {steps.map((step, i) => (
        <motion.li
          key={i}
          className="relative flex gap-3"
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: reduce ? 0 : 0.1 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-accent)]/40 font-mono text-[11px] text-accent">
            {i + 1}
          </span>
          <p className="text-[15px] leading-relaxed text-ink/90">{step}</p>
        </motion.li>
      ))}
    </ol>
  );
}
