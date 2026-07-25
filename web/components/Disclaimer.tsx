import { Scales } from "@phosphor-icons/react/dist/ssr";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-3 text-[13px] leading-relaxed text-dim">
      <Scales size={18} weight="regular" className="mt-[1px] shrink-0 text-faint" />
      <p>
        Receipts is a reasoning aid, not a verdict. It shows how well-supported a
        claim is and points you to evidence. It does not decide what is true.
      </p>
    </div>
  );
}
