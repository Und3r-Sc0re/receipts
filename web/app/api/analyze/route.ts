import { NextRequest, NextResponse } from "next/server";
import { MAX_CLAIM_CHARS } from "@/lib/analyze-schema";
import { analyzeWithNim, hasKey } from "@/lib/nim";
import { findMockByText } from "@/lib/examples";

export const runtime = "nodejs";

const CORS_HEADERS: Record<string, string> = {
  // Public, secret-free, rate-limited endpoint. Permissive CORS lets the
  // browser extension call it from any page.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Best-effort in-memory rate limit. Per-instance only (serverless resets it),
// which is fine for a demo. The real cost guards are the input cap + max_tokens.
// Production upgrade: @upstash/ratelimit backed by Redis.
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQ = 15;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQ;
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  if (rateLimited(ip)) {
    return json({ error: "Too many checks in a short window. Try again in a few minutes." }, 429);
  }

  let body: { text?: unknown; sourceUrl?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl : undefined;

  if (!text) {
    return json({ error: "Paste a claim to check." }, 400);
  }
  if (text.length > MAX_CLAIM_CHARS) {
    return json(
      { error: `That's a bit long. Keep it under ${MAX_CLAIM_CHARS} characters.` },
      400,
    );
  }

  // Mock mode: no key configured. Return sample analysis so the product is
  // fully demoable. Small delay makes the loading state feel real.
  if (!hasKey()) {
    await new Promise((r) => setTimeout(r, 700));
    return json({ result: findMockByText(text), mock: true });
  }

  try {
    const result = await analyzeWithNim(text, sourceUrl);
    return json({ result, mock: false });
  } catch (err) {
    console.error("analyze error:", err);
    return json(
      { error: "The analysis engine had trouble with that one. Try rephrasing or try again." },
      502,
    );
  }
}
