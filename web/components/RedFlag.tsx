"use client";

import { motion, useReducedMotion } from "motion/react";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import type { RedFlag as RedFlagType } from "@/lib/analyze-schema";

export function RedFlagList({ flags }: { flags: RedFlagType[] }) {
  const reduce = useReducedMotion();

  if (flags.length === 0) {
    return (
      <p className="font-mono text-[13px] text-dim">
        No major reasoning gaps found in how this is stated.
      </p>
    );
  }

  return (
    <ul className="grid gap-2.5">
      {flags.map((flag, i) => (
        <motion.li
          key={`${flag.type}-${i}`}
          className="rounded-md border border-[color:var(--color-line)] bg-elev2/60 p-3"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: reduce ? 0 : 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2">
            <Warning size={15} weight="fill" style={{ color: "var(--s-1)" }} />
            <span
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "var(--s-2)" }}
            >
              {flag.type.replace(/-/g, " ")}
            </span>
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink/90">{flag.note}</p>
        </motion.li>
      ))}
    </ul>
  );
}
