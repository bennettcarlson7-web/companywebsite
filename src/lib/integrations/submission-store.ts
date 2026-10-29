import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { IntakeEnv } from "./env";

/**
 * Durable record of every accepted submission — the website's own "applicant tracking" inbox, like the database
 * behind Greenhouse or Lever. A submission counts as received once it's saved here, even if email is down or not
 * configured. Email is a notification on top.
 */

export type SubmissionKind = "inquiry" | "application";

export type StoredSubmission = {
  id: string;
  kind: SubmissionKind;
  receivedAt: string;
  data: Record<string, unknown>;
};

export interface SubmissionStore {
  readonly name: "file" | "upstash";
  save(submission: StoredSubmission): Promise<void>;
}

/** Retention from the Privacy Policy (plus a small margin for "after the role closes"/"after last contact"). */
const RETENTION_SECONDS: Record<SubmissionKind, number> = {
  application: 13 * 31 * 24 * 3600,
  inquiry: 25 * 31 * 24 * 3600,
};

export const SUBMISSION_FILES: Record<SubmissionKind, string> = { application: "applications.jsonl", inquiry: "inquiries.jsonl" };

/** Appends one JSON line per submission to `<dir>/applications.jsonl` or `inquiries.jsonl`, readable only by the server's user. */
export class FileSubmissionStore implements SubmissionStore {
  readonly name = "file" as const;
  constructor(private dir: string) {}

  async save(s: StoredSubmission): Promise<void> {
    // Runtime data directory, not source: keep it out of Next.js output-file tracing.
    await mkdir(/*turbopackIgnore: true*/ this.dir, { recursive: true, mode: 0o700 });
    await appendFile(path.join(/*turbopackIgnore: true*/ this.dir, SUBMISSION_FILES[s.kind]), `${JSON.stringify(s)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
  }
}

/** Upstash Redis (REST): one key per submission with retention TTL, plus a time-ordered index per kind. */
export class UpstashSubmissionStore implements SubmissionStore {
  readonly name = "upstash" as const;
  constructor(
    private url: string,
    private token: string,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  async save(s: StoredSubmission): Promise<void> {
    const key = `submission:${s.kind}:${s.id}`;
    const res = await this.fetchImpl(`${this.url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["SET", key, JSON.stringify(s), "EX", String(RETENTION_SECONDS[s.kind])],
        ["ZADD", `submissions:${s.kind}`, String(Date.parse(s.receivedAt)), s.id],
      ]),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`upstash_${res.status}`);
    const results = (await res.json()) as { error?: string }[];
    if (results.some((r) => r.error)) throw new Error("upstash_command_error");
  }
}

/** Upstash when configured (works on serverless); otherwise the local directory; otherwise none. */
export function createSubmissionStore(env: IntakeEnv): SubmissionStore | undefined {
  if (env.upstashUrl && env.upstashToken) return new UpstashSubmissionStore(env.upstashUrl, env.upstashToken);
  if (env.submissionsDir) return new FileSubmissionStore(path.resolve(/*turbopackIgnore: true*/ env.submissionsDir));
  return undefined;
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
