// The deployed API base. After deploying the web app to Vercel, set this to
// your deployment (e.g. "https://receipts-xyz.vercel.app") and rebuild.
// host_permissions in manifest.json must include this origin.
//
// For local testing against `npm run dev`, use http://localhost:3000.
export const API_BASE = "http://localhost:3000";

export const ANALYZE_ENDPOINT = `${API_BASE}/api/analyze`;

export const MAX_CLAIM_CHARS = 4000;
