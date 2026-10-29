import { envelopeSchema, SUBMISSION_LIMITS } from "@/lib/validation/shared";
import type { RateLimiter } from "./rate-limit";

export type SubmissionRequest = {
  rawBody: string;
  contentType: string | null;
  ip: string;
  origin: string | null;
  host: string | null;
};

export type GuardResult =
  | { ok: true; payload: Record<string, unknown>; submissionId?: string }
  | { ok: false; httpStatus: number; body: { status: "rejected" } | { status: "rate_limited"; retryAfterSeconds: number }; headers?: Record<string, string> };

export type Logger = (event: Record<string, unknown>) => void;

/**
 * Checks shared by every public form, in order: same-origin → JSON content type → body size → rate limit
 * (per form type and IP) → JSON parse → honeypot and minimum fill time.
 * Logs carry outcome codes only — never field values.
 */
export async function guardSubmission(
  req: SubmissionRequest,
  opts: { namespace: string; limiter: RateLimiter; log: Logger },
): Promise<GuardResult> {
  const { log } = opts;
  const reject = (httpStatus: number, reason?: string): GuardResult => {
    if (reason) log({ outcome: "rejected", reason });
    return { ok: false, httpStatus, body: { status: "rejected" } };
  };

  if (req.origin && req.host) {
    let originHost: string | null = null;
    try {
      originHost = new URL(req.origin).host;
    } catch {
      /* invalid origin falls through to rejection */
    }
    if (originHost !== req.host) return reject(403, "origin");
  }

  if (!req.contentType?.toLowerCase().startsWith("application/json")) return reject(415);
  if (new TextEncoder().encode(req.rawBody).length > SUBMISSION_LIMITS.bodyBytes) return reject(413, "too_large");

  let limit;
  try {
    limit = await opts.limiter.hit(`${opts.namespace}:${req.ip}`);
  } catch {
    // If the shared limiter is unavailable, fail open rather than blocking real people.
    log({ outcome: "limiter_unavailable" });
    limit = { allowed: true, retryAfterSeconds: 0 };
  }
  if (!limit.allowed) {
    log({ outcome: "rate_limited" });
    return {
      ok: false,
      httpStatus: 429,
      body: { status: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds },
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(req.rawBody);
  } catch {
    return reject(400);
  }
  const envelope = envelopeSchema.safeParse(json);
  if (!envelope.success) return reject(400);

  const { website, elapsedMs, payload, submissionId } = envelope.data;
  if ((website && website.length > 0) || elapsedMs === undefined || elapsedMs < SUBMISSION_LIMITS.minFillMs) {
    return reject(400, "spam_signal");
  }
  return { ok: true, payload, submissionId };
}

/**
 * Remembers submission IDs that were already delivered, so a double-click or retry after a slow response
 * doesn't send a second email. Per server instance; a short window is enough for double submits.
 */
export class DeliveredSubmissions {
  private seen = new Map<string, number>();
  constructor(private ttlMs = 10 * 60 * 1000, private now: () => number = Date.now) {}

  has(id: string | undefined): boolean {
    if (!id) return false;
    const exp = this.seen.get(id);
    if (exp === undefined) return false;
    if (exp <= this.now()) {
      this.seen.delete(id);
      return false;
    }
    return true;
  }

  add(id: string | undefined) {
    if (!id) return;
    if (this.seen.size > 5000) for (const [k, v] of this.seen) if (v <= this.now()) this.seen.delete(k);
    this.seen.set(id, this.now() + this.ttlMs);
  }
}

const SETUP_HINT =
  "No storage or email provider is configured for this environment: set KV_REST_API_URL/KV_REST_API_TOKEN (Vercel Storage > Upstash for Redis) or SMTP_*/RESEND_API_KEY, then redeploy. See docs/GO_LIVE.md.";

/** Structured logs; setup and delivery problems go to stderr so they show as errors in Vercel's logs. */
export const defaultLogger =
  (event: string): Logger =>
  (e) => {
    const problem = e.outcome === "unconfigured" || e.outcome === "delivery_failure";
    const line = JSON.stringify({ event, ...e, ...(e.outcome === "unconfigured" ? { hint: SETUP_HINT } : {}) });
    if (problem) console.error(line);
    else console.info(line);
  };
