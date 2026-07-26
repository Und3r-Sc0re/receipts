# Receipts

**Show the receipts on anything online.**

Highlight any claim — a tweet on X, a Reddit comment, a news headline — and Receipts shows you *how well-supported that claim actually is*: a support-strength meter, the reasoning behind the assessment (shown step by step), the logical red flags (correlation vs. causation, missing baseline, cherry-picking…), what evidence would settle it, ready-to-run search queries, and the strongest good-faith opposing view.

**Receipts is a reasoning aid, not a fact-checker. It never says "true" or "false."** It assesses how well-supported a claim is *as written*, exposes its reasoning, and hands you the tools to decide for yourself.

There are two ways in:
1. **Web app** — zero install, works instantly: **https://receiptscheck.vercel.app**
2. **Chrome extension** — select text on *any* website and check it in place. No build step required — see below.

Both share one backend and one analysis contract.

---

## Try the web app

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000. Click an example chip for a one-click result, or paste your own claim.

### Live model (optional but recommended)

Out of the box the app runs in **sample mode** (pre-written analyses) so it's demoable with zero setup. To get real, per-claim analysis, add a free NVIDIA NIM key:

1. Get a free key at https://build.nvidia.com (no credit card).
2. `cp web/.env.example web/.env.local` and set `NVIDIA_API_KEY=...`
3. Restart `npm run dev`.

The key is read **only** server-side inside `web/app/api/analyze/route.ts`. It is never sent to the browser or the extension.

---

## Load the Chrome extension

**For judges — no build step, no npm install.** `extension/dist/` is a prebuilt, ready-to-load bundle already committed to this repo, pointed at the live deployment (`https://receiptscheck.vercel.app`).

1. Download this repo — either `git clone https://github.com/Und3r-Sc0re/receipts.git`, or on the GitHub page: **Code → Download ZIP**, then unzip.
2. In Chrome, go to `chrome://extensions`
3. Turn on **Developer mode** (top right)
4. Click **Load unpacked** and select the `extension/dist` folder
5. Go to any page (a tweet, a Reddit thread, a news article), select some text → click the floating **"⧉ Check receipts"** button (or right-click → *Check receipts on selection*)

That's it — the extension calls the live backend directly, same as the web app.

### If you're modifying the extension's source

```bash
cd extension
npm install
npm run build     # re-bundles src/ into dist/
```

By default `extension/src/config.ts` points `API_BASE` at the deployed URL. For local testing against `npm run dev`, change it to `http://localhost:3000`, make sure that origin is in `host_permissions` in `manifest.json`, and rebuild.

---

## Deploy the web app (Vercel)

1. Push this repo to GitHub.
2. Import the repo in Vercel, set the project root to `web/`.
3. Add the environment variable `NVIDIA_API_KEY` in the Vercel project settings.
4. Deploy. The resulting URL is your public, tryable link.

The `/api/analyze` route runs as a Vercel serverless function and sets permissive CORS so the extension can call it from any page.

---

## How the AI is used (the prompting pipeline)

The analysis is a single structured call to an open model (NVIDIA NIM, `nvidia/llama-3.3-nemotron-super-49b-v1` with a faster `meta/llama-3.1-8b-instruct` fallback, OpenAI-compatible), engineered to be a reasoning tool rather than a verdict machine:

- **System prompt** (`web/lib/prompt.ts`) establishes an evidence-and-reasoning role that is explicitly forbidden from issuing true/false verdicts, moralizing, or inventing facts.
- **Red-flag taxonomy** — the model classifies weaknesses against a fixed set (correlation-vs-causation, missing-baseline, cherry-picking, vague-quantifier, unnamed-source, appeal-to-authority, unfalsifiable, and more) so results are consistent and legible.
- **Claim-type classification** — fact / opinion / prediction / causal / statistical / mixed, which frames how support is judged.
- **Visible reasoning chain** — the model must expose 3–5 reasoning steps; these are rendered as the centerpiece of the result, so you see the work, not just a score.
- **Structured JSON contract** (`web/lib/analyze-schema.ts`) — the response is validated and defaulted at runtime; a robust parse-repair step (`web/lib/nim.ts`) extracts valid JSON even when the open model wraps or fumbles the format.
- **Steelman generation** — every result includes the strongest opposing interpretation, to counter confirmation bias.
- **Guardrails** — input length cap, best-effort per-IP rate limiting, a graceful fallback model, and a "not a verdict" disclaimer on every result.

The same JSON contract powers both the React web UI and the vanilla Shadow-DOM extension overlay.

---

## Project structure

```
receipts/
├── web/               Next.js app — landing + live tool + /api/analyze proxy
│   ├── app/api/analyze/route.ts   the serverless backend (key lives here only)
│   ├── lib/prompt.ts              system prompt + red-flag taxonomy + few-shot
│   ├── lib/nim.ts                 NVIDIA NIM client + JSON parse-repair
│   ├── lib/analyze-schema.ts      the shared analysis contract
│   └── components/                receipt-themed UI (meter, reasoning chain, flags)
└── extension/         Chrome MV3 extension
    ├── src/content.ts             selection detection + floating button
    ├── src/background.ts          service worker (owns the API call)
    ├── src/overlay.ts             Shadow-DOM panel + styles
    └── src/render.ts              vanilla renderer (mirrors the web result)
```

---

## Limitations (honest)

- Runs on an open model; its reasoning is a helpful starting point, not authoritative.
- It assesses claims *as written* and points to evidence — it does not browse or fetch sources itself.
- Not legal, medical, or financial advice. Not a definitive fact-check. The point is to help you think, not to think for you.

---

## Tech

Next.js 15 · React 19 · Tailwind v4 · Motion · NVIDIA NIM (OpenAI-compatible) · Chrome Manifest V3 · esbuild. No database, no login.
