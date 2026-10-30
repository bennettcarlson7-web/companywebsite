import { createRedis, type Redis } from "@/lib/data/redis";
import type { IntakeEnv } from "./env";

/**
 * Durable record of every accepted submission — the website's own "applicant tracking" inbox, like the database
 * behind Greenhouse or Lever. A submission counts as received once it's saved here, even if email is down or not
 * configured. Email is a notification on top. The admin area reads the same records.
 */

export type SubmissionKind = "inquiry" | "application";

export type StoredSubmission = {
  id: string;
  kind: SubmissionKind;
  receivedAt: string;
  data: Record<string, unknown>;
};

export interface SubmissionStore {
  readonly name: Redis["name"];
  save(submission: StoredSubmission): Promise<void>;
}

/** Retention from the Privacy Policy (plus a small margin for "after the role closes"/"after last contact"). */
export const RETENTION_SECONDS: Record<SubmissionKind, number> = {
  application: 13 * 31 * 24 * 3600,
  inquiry: 25 * 31 * 24 * 3600,
};

/** Storage keys. The full record holds the résumé file; the summary omits it so lists stay small and fast. */
export const submissionKeys = {
  record: (kind: SubmissionKind, id: string) => `submission:${kind}:${id}`,
  summary: (kind: SubmissionKind, id: string) => `submission-summary:${kind}:${id}`,
  index: (kind: SubmissionKind) => `submissions:${kind}`,
};

/** The record without file contents (a résumé keeps its name, type, and size). */
export function summarize(s: StoredSubmission): StoredSubmission {
  const resume = s.data.resume as { data?: unknown } | undefined;
  if (!resume || typeof resume !== "object" || !("data" in resume)) return s;
  const { data: _file, ...meta } = resume; // eslint-disable-line @typescript-eslint/no-unused-vars
  return { ...s, data: { ...s.data, resume: meta } };
}

/** One record + one summary per submission, each with the retention TTL, plus a time-ordered index per kind. */
export class RedisSubmissionStore implements SubmissionStore {
  constructor(private redis: Redis) {}

  get name() {
    return this.redis.name;
  }

  async save(s: StoredSubmission): Promise<void> {
    const ttl = RETENTION_SECONDS[s.kind];
    await this.redis.exec([
      ["SET", submissionKeys.record(s.kind, s.id), JSON.stringify(s), "EX", ttl],
      ["SET", submissionKeys.summary(s.kind, s.id), JSON.stringify(summarize(s)), "EX", ttl],
      ["ZADD", submissionKeys.index(s.kind), Date.parse(s.receivedAt), s.id],
    ]);
  }
}

/** Upstash when configured (works on serverless); otherwise the local file store; otherwise none. */
export function createSubmissionStore(env: IntakeEnv): SubmissionStore | undefined {
  const redis = createRedis(env);
  return redis ? new RedisSubmissionStore(redis) : undefined;
}

/** Saves a submission, reporting only success or an error code (never content). */
export async function saveSubmission(store: SubmissionStore | undefined, s: StoredSubmission): Promise<{ ok: boolean; detail?: string } | null> {
  if (!store) return null;
  try {
    await store.save(s);
    return { ok: true };
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : err instanceof Error ? err.message : "error";
    return { ok: false, detail: `store_${store.name}_${code}`.slice(0, 80) };
  }
}
