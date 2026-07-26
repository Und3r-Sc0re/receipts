"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Receipt, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { ClaimInput } from "@/components/ClaimInput";
import { ReceiptResult } from "@/components/ReceiptResult";
import type { AnalyzeResult } from "@/lib/analyze-schema";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: AnalyzeResult; mock: boolean }
  | { status: "error"; message: string };

export default function Home() {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function run(text: string) {
    const claim = text.trim();
    if (!claim) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: claim }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: data.error ?? "Something went wrong." });
        return;
      }
      setState({ status: "done", result: data.result, mock: Boolean(data.mock) });
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  return (
    <main className="relative z-10 mx-auto min-h-[100dvh] max-w-[860px] px-5 py-14 sm:px-6 sm:py-20">
      {/* Hero */}
      <header>
        <div className="flex items-center gap-2">
          <Receipt size={22} weight="fill" className="text-accent" />
          <span className="font-mono text-[15px] font-bold uppercase tracking-[0.3em] text-ink">
            Receipts
          </span>
        </div>

        <h1 className="mt-8 max-w-[16ch] text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[3.4rem]">
          Show the receipts on anything online.
        </h1>

        <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-dim">
          Paste any claim and see how well it&rsquo;s actually supported: the
          reasoning, the red flags, and where to check. Not a verdict.
        </p>
      </header>

      {/* Tool */}
      <div className="mt-10">
        <ClaimInput
          value={value}
          onChange={setValue}
          onSubmit={() => run(value)}
          onExample={(text) => {
            setValue(text);
            run(text);
          }}
          loading={state.status === "loading"}
        />
      </div>

      {/* Result area */}
      <div className="mt-12">
        {state.status === "loading" && <LoadingReceipt />}

        {state.status === "error" && (
          <div className="mx-auto flex max-w-[640px] items-start gap-3 rounded-xl border border-[color:var(--s-1)]/30 bg-elev px-5 py-4 text-[14px] text-dim">
            <WarningCircle size={20} weight="fill" style={{ color: "var(--s-1)" }} className="mt-[1px] shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        {state.status === "done" && (
          <ReceiptResult
            result={state.result}
            mock={state.mock}
            sourceLabel="pasted"
          />
        )}
      </div>

      <footer className="mt-20 border-t border-[color:var(--color-line)] pt-6">
        <p className="font-mono text-[11px] leading-relaxed text-faint">
          Receipts assesses how well-supported a claim is as written and points
          you to evidence. It is a reasoning aid, not a fact-checker, and does
          not decide what is true.
        </p>
      </footer>
    </main>
  );
}

function LoadingReceipt() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto w-full max-w-[640px]"
    >
      <div className="perf-edge" />
      <div className="border-x border-[color:var(--color-line)] bg-elev px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-[15px] font-bold uppercase tracking-[0.25em] text-faint">
            Receipts
          </span>
          <span className="font-mono text-[11px] text-faint">reading…</span>
        </div>
        <div className="receipt-rule mb-6" />
        <p className="mb-6 font-mono text-[11px] leading-relaxed text-faint">
          Free-tier inference can take up to a minute or two. Worth the wait.
        </p>
        <div className="grid gap-3">
          {[90, 70, 82, 55, 76, 64].map((w, i) => (
            <motion.div
              key={i}
              className="h-3 rounded bg-elev2"
              style={{ width: `${w}%` }}
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </div>
      <div className="perf-edge perf-edge--bottom" />
    </motion.div>
  );
}
