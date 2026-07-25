"use client";

import { Receipt, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { EXAMPLES } from "@/lib/examples";
import { MAX_CLAIM_CHARS } from "@/lib/analyze-schema";

export function ClaimInput({
  value,
  onChange,
  onSubmit,
  onExample,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onExample: (text: string) => void;
  loading: boolean;
}) {
  const disabled = loading || value.trim().length === 0;

  return (
    <div>
      <div className="relative rounded-xl border border-[color:var(--color-line)] bg-elev focus-within:border-[color:var(--color-accent)]/50 transition-colors">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CLAIM_CHARS))}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !disabled) {
              onSubmit();
            }
          }}
          rows={4}
          placeholder="Paste a claim, a tweet, a headline…"
          aria-label="Claim to check"
          className="w-full resize-none bg-transparent px-4 py-4 text-[16px] leading-relaxed text-ink placeholder:text-faint focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--color-line)] px-4 py-3">
          <span className="font-mono text-[11px] text-faint">
            {value.length}/{MAX_CLAIM_CHARS}
            <span className="ml-2 hidden sm:inline">⌘⏎ to check</span>
          </span>
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="group flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-medium text-[#1a1408] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <CircleNotch size={17} weight="bold" className="animate-spin" />
            ) : (
              <Receipt size={17} weight="fill" />
            )}
            {loading ? "Reading…" : "Check receipts"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          Try:
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => onExample(ex.text)}
            disabled={loading}
            className="rounded-full border border-[color:var(--color-line)] px-3 py-1.5 text-[13px] text-dim transition-colors hover:border-[color:var(--color-accent)]/40 hover:text-ink disabled:opacity-40"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
