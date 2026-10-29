import type { IntakeEnv } from "./env";

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export interface RateLimiter {
  hit(key: string): Promise<RateLimitResult>;
}

/**
 * Fixed-window limiter held in process memory.
 * Good enough for local development and a single long-running server. On serverless platforms
 * every instance has its own memory, so limits are per-instance and reset on cold starts —
 * configure Upstash (below) for a real, shared limit in production.
 */
export class MemoryRateLimiter implements RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private max: number,
    private windowMs: number,
    private now: () => number = Date.now,
  ) {}

  async hit(key: string): Promise<RateLimitResult> {
    const t = this.now();
    if (this.hits.size > 10_000) this.sweep(t);
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= t) {
      this.hits.set(key, { count: 1, resetAt: t + this.windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    entry.count += 1;
    const retryAfterSeconds = Math.ceil((entry.resetAt - t) / 1000);
    return { allowed: entry.count <= this.max, retryAfterSeconds: entry.count <= this.max ? 0 : retryAfterSeconds };
  }

  private sweep(t: number) {
    for (const [k, v] of this.hits) if (v.resetAt <= t) this.hits.delete(k);
  }
}

/** Distributed fixed-window limiter using the Upstash Redis REST API (no SDK required). */
export class UpstashRateLimiter implements RateLimiter {
  constructor(
    private url: string,
    private token: string,
    private max: number,
    private windowMs: number,
  ) {}

  async hit(key: string): Promise<RateLimitResult> {
    const redisKey = `ratelimit:${key}`;
    const res = await fetch(`${this.url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["PEXPIRE", redisKey, String(this.windowMs), "NX"],
        ["PTTL", redisKey],
      ]),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash responded ${res.status}`);
    const [incr, , pttl] = (await res.json()) as { result: number }[];
    const count = Number(incr?.result ?? 0);
    const ttlMs = Math.max(0, Number(pttl?.result ?? this.windowMs));
    const allowed = count <= this.max;
    return { allowed, retryAfterSeconds: allowed ? 0 : Math.ceil(ttlMs / 1000) };
  }
}

let memoryLimiter: MemoryRateLimiter | undefined;

export function createRateLimiter(env: IntakeEnv): RateLimiter {
  if (env.upstashUrl && env.upstashToken) {
    return new UpstashRateLimiter(env.upstashUrl, env.upstashToken, env.rateLimitMax, env.rateLimitWindowMs);
  }
  memoryLimiter ??= new MemoryRateLimiter(env.rateLimitMax, env.rateLimitWindowMs);
  return memoryLimiter;
}
