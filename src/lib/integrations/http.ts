import { SUBMISSION_LIMITS } from "@/lib/validation/shared";
import type { SubmissionRequest } from "./submission-guard";

/**
 * Client IP for rate limiting. Behind Vercel/most proxies the first X-Forwarded-For entry is the client;
 * only trust this header when the app runs behind a proxy that sets it.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}

/** Reads a public form POST into the framework-agnostic shape the handlers expect, or `null` if oversized. */
export async function readSubmission(request: Request): Promise<SubmissionRequest | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > SUBMISSION_LIMITS.bodyBytes) return null;
  return {
    rawBody: await request.text(),
    contentType: request.headers.get("content-type"),
    ip: clientIp(request.headers),
    origin: request.headers.get("origin"),
    host: request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  };
}

export function jsonResponse(body: unknown, status: number, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}
