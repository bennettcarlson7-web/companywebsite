import { envelopeSchema, inquirySchema, LIMITS, toFieldErrors, type InquiryResponse } from "@/lib/validation/inquiry";
import { isCrmConfigured, isEmailConfigured, type InquiryEnv } from "./env";
import type { RateLimiter } from "./rate-limit";
import { sendInquiryEmail, sendInquiryToHubSpot, type DeliveryResult } from "./deliver";

export type InquiryRequest = {
  rawBody: string;
  contentType: string | null;
  ip: string;
  origin: string | null;
  host: string | null;
};

export type InquiryDeps = {
  env: InquiryEnv;
  limiter: RateLimiter;
  fetchImpl?: typeof fetch;
  log?: (event: Record<string, unknown>) => void;
};

export type InquiryResult = { httpStatus: number; body: InquiryResponse; headers?: Record<string, string> };

/**
 * Framework-agnostic inquiry pipeline:
 * origin check → size/content-type → rate limit → parse → spam signals → validation → delivery.
 * Logs contain outcomes only — never names, emails, or project descriptions.
 */
export async function handleInquiry(req: InquiryRequest, deps: InquiryDeps): Promise<InquiryResult> {
  const log = deps.log ?? ((e) => console.info(JSON.stringify({ event: "inquiry", ...e })));

  if (req.origin && req.host) {
    let originHost: string | null = null;
    try {
      originHost = new URL(req.origin).host;
    } catch {
      /* invalid origin falls through to rejection */
    }
    if (originHost !== req.host) {
      log({ outcome: "rejected", reason: "origin" });
      return { httpStatus: 403, body: { status: "rejected" } };
    }
  }

  if (!req.contentType?.toLowerCase().startsWith("application/json")) {
    return { httpStatus: 415, body: { status: "rejected" } };
  }
  if (new TextEncoder().encode(req.rawBody).length > LIMITS.bodyBytes) {
    log({ outcome: "rejected", reason: "too_large" });
    return { httpStatus: 413, body: { status: "rejected" } };
  }

  let limit;
  try {
    limit = await deps.limiter.hit(req.ip);
  } catch {
    // If the shared limiter is unavailable, fail open rather than blocking real leads.
    log({ outcome: "limiter_unavailable" });
    limit = { allowed: true, retryAfterSeconds: 0 };
  }
  if (!limit.allowed) {
    log({ outcome: "rate_limited" });
    return {
      httpStatus: 429,
      body: { status: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds },
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(req.rawBody);
  } catch {
    return { httpStatus: 400, body: { status: "rejected" } };
  }
  const envelope = envelopeSchema.safeParse(json);
  if (!envelope.success) return { httpStatus: 400, body: { status: "rejected" } };

  const { website, elapsedMs, inquiry: raw } = envelope.data;
  if ((website && website.length > 0) || elapsedMs === undefined || elapsedMs < LIMITS.minFillMs) {
    log({ outcome: "rejected", reason: "spam_signal" });
    return { httpStatus: 400, body: { status: "rejected" } };
  }

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    log({ outcome: "invalid" });
    return { httpStatus: 422, body: { status: "invalid", fieldErrors: toFieldErrors(parsed.error) } };
  }

  const channels: Promise<DeliveryResult>[] = [];
  if (isEmailConfigured(deps.env)) channels.push(sendInquiryEmail(parsed.data, deps.env, deps.fetchImpl));
  if (isCrmConfigured(deps.env)) channels.push(sendInquiryToHubSpot(parsed.data, deps.env, deps.fetchImpl));

  if (channels.length === 0) {
    log({ outcome: "unconfigured" });
    return { httpStatus: 503, body: { status: "unconfigured" } };
  }

  const results = await Promise.all(channels);
  const failures = results.filter((r) => !r.ok).map((r) => r.detail ?? r.channel);
  if (failures.length) log({ outcome: "delivery_failure", failures });

  // The visitor only sees "sent" if the primary channel (email, when configured) accepted it.
  const primary = results.find((r) => r.channel === "email") ?? results[0]!;
  if (!primary.ok) return { httpStatus: 502, body: { status: "error" } };

  log({ outcome: "sent", channels: results.filter((r) => r.ok).map((r) => r.channel) });
  return { httpStatus: 200, body: { status: "sent" } };
}
