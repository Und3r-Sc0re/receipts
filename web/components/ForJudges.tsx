"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CaretDown,
  GithubLogo,
  PuzzlePiece,
  Timer,
  ArrowSquareOut,
} from "@phosphor-icons/react/dist/ssr";

const REPO_URL = "https://github.com/Und3r-Sc0re/receipts";

export function ForJudges() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 rounded-xl border border-[color:var(--color-line)] bg-elev/60">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
          <PuzzlePiece size={15} className="text-accent" />
          For judges: run this in under a minute
        </span>
        <CaretDown
          size={14}
          className={`shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="receipt-rule" />
            <div className="grid gap-6 px-5 py-5 sm:grid-cols-2">
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                  1. Web app (this page)
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-dim">
                  Nothing to install. Click one of the example chips above the
                  input for a one-click result, or paste any claim of your
                  own.
                </p>
              </div>

              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                  2. Chrome extension
                </h3>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-[13px] leading-relaxed text-dim">
                  <li>
                    Download the repo (zip or{" "}
                    <code className="rounded bg-elev2 px-1 py-0.5 font-mono text-[12px] text-ink/90">
                      git clone
                    </code>
                    )
                  </li>
                  <li>Open <code className="rounded bg-elev2 px-1 py-0.5 font-mono text-[12px] text-ink/90">chrome://extensions</code></li>
                  <li>Turn on Developer mode</li>
                  <li>
                    Load unpacked →{" "}
                    <code className="rounded bg-elev2 px-1 py-0.5 font-mono text-[12px] text-ink/90">
                      extension/dist
                    </code>
                  </li>
                  <li>Select text on any page, click the floating button</li>
                </ol>
                <p className="mt-2 text-[12px] leading-relaxed text-faint">
                  dist/ is prebuilt and already committed, no npm install
                  needed.
                </p>
              </div>
            </div>

            <div className="receipt-rule" />

            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5 text-[12px] leading-relaxed text-dim">
                <Timer size={16} className="mt-[1px] shrink-0 text-accent" />
                <span>
                  Live analysis calls a free-tier open model and typically
                  takes 15&ndash;30 seconds. That wait is the real pipeline
                  running, not a bug.
                </span>
              </div>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1.5 self-start rounded-md border border-[color:var(--color-line)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/90 transition-colors hover:border-[color:var(--color-accent)]/40 hover:bg-accent-soft sm:self-auto"
              >
                <GithubLogo size={14} />
                Source
                <ArrowSquareOut size={12} className="text-faint" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
