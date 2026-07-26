// NVIDIA NIM client (OpenAI-compatible). The API key lives ONLY here,
// server-side, read from process.env. It is never sent to the client.

import OpenAI from "openai";
import { buildMessages } from "./prompt";
import { coerceResult, type AnalyzeResult } from "./analyze-schema";

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const PRIMARY_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1";
const FALLBACK_MODEL = "meta/llama-3.1-8b-instruct";

export function hasKey(): boolean {
  return Boolean(process.env.NVIDIA_API_KEY);
}

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: NIM_BASE_URL,
      apiKey: process.env.NVIDIA_API_KEY,
      timeout: 45_000,
      maxRetries: 0,
    });
  }
  return client;
}

export async function analyzeWithNim(
  text: string,
  sourceUrl?: string,
): Promise<AnalyzeResult> {
  const messages = buildMessages(text, sourceUrl);

  const call = (model: string) =>
    getClient().chat.completions.create({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 700,
      response_format: { type: "json_object" },
    });

  let content: string | null = null;
  try {
    const res = await call(PRIMARY_MODEL);
    content = res.choices[0]?.message?.content ?? null;
  } catch {
    const res = await call(FALLBACK_MODEL);
    content = res.choices[0]?.message?.content ?? null;
  }

  if (!content) throw new Error("Empty response from model.");

  const parsed = parseModelJson(content);
  const result = coerceResult(parsed);
  if (!result) throw new Error("Model response did not match the expected shape.");
  return result;
}

// Open models don't always honor response_format perfectly. Try a straight
// parse; if that fails, extract the first balanced { ... } block and parse it.
function parseModelJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const block = extractFirstJsonObject(trimmed);
    if (block) {
      try {
        return JSON.parse(block);
      } catch {
        /* fall through */
      }
    }
    throw new Error("Could not parse JSON from model output.");
  }
}

function extractFirstJsonObject(s: string): string | null {
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') inString = !inString;
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}
