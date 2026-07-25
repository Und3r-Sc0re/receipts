"use client";

import { motion, useReducedMotion } from "motion/react";
import type { SupportLabel } from "@/lib/analyze-schema";

const SEGMENT_COLORS = [
  "var(--s-1)",
  "var(--s-2)",
  "var(--s-3)",
  "var(--s-4)",
  "var(--s-5)",
];

export function SupportMeter({
  level,
  label,
}: {
  level: number;
  label: SupportLabel;
}) {
  const reduce = useReducedMotion();
  const activeColor = SEGMENT_COLORS[level - 1] ?? "var(--s-3)";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          Support strength
        </span>
        <span
          className="font-mono text-[13px] uppercase tracking-wider"
          style={{ color: activeColor }}
        >
          {label} · {level}/5
        </span>
      </div>

      <div className="mt-2 flex gap-1.5" role="img" aria-label={`Support strength ${level} of 5: ${label}`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < level;
          return (
            <motion.div
              key={i}
              className="h-2.5 flex-1 rounded-[2px]"
              style={{
                backgroundColor: filled ? activeColor : "var(--color-elev2)",
                transformOrigin: "left",
              }}
              initial={reduce ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
      </div>

      <p className="mt-2 font-mono text-[11px] leading-relaxed text-faint">
        How well-evidenced the claim is as written, not a truth verdict.
      </p>
    </div>
  );
}
