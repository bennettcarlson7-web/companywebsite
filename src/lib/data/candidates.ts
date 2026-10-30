import { RETENTION_SECONDS, submissionKeys, summarize, type StoredSubmission } from "@/lib/integrations/submission-store";
import type { Redis } from "./redis";

/**
 * Candidate records for the admin area: the saved applications plus the hiring team's review (status + notes).
 * Reviews are stored next to each application and expire with it, so the retention policy covers both.
 */

export const candidateStatuses = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Not selected" },
] as const;
export type CandidateStatus = (typeof candidateStatuses)[number]["value"];

export type CandidateReview = { status: CandidateStatus; notes: string; updatedAt: string; updatedBy: string };
export type Candidate = { id: string; receivedAt: string; data: Record<string, unknown>; review: CandidateReview | null };

const KIND = "application" as const;
const reviewKey = (id: string) => `candidate-review:${id}`;
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isCandidateId = (id: string) => ID.test(id);
export const statusOf = (c: Pick<Candidate, "review">): CandidateStatus => c.review?.status ?? "new";

const parse = <T>(v: unknown): T | null => {
  if (typeof v !== "string") return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
};

/** Newest first. Uses the small summaries (no résumé contents); older records without one are summarized here. */
export async function listCandidates(redis: Redis, limit = 1000): Promise<Candidate[]> {
  const [ids] = (await redis.exec([["ZRANGE", submissionKeys.index(KIND), 0, limit - 1, "REV"]])) as [string[]];
  if (!ids?.length) return [];
  const [summaries, reviews] = (await redis.exec([
    ["MGET", ...ids.map((id) => submissionKeys.summary(KIND, id))],
    ["MGET", ...ids.map(reviewKey)],
  ])) as [unknown[], unknown[]];

  const missing = ids.filter((_, i) => summaries[i] === null);
  const legacy = missing.length ? ((await redis.exec([["MGET", ...missing.map((id) => submissionKeys.record(KIND, id))]])) as [unknown[]])[0] : [];
  const legacyById = new Map(missing.map((id, i) => [id, parse<StoredSubmission>(legacy[i])]));

  const out: Candidate[] = [];
  const expired: string[] = [];
  ids.forEach((id, i) => {
    const s = parse<StoredSubmission>(summaries[i]) ?? (legacyById.get(id) ? summarize(legacyById.get(id)!) : null);
    if (!s) return void expired.push(id);
    out.push({ id, receivedAt: s.receivedAt, data: s.data, review: parse<CandidateReview>(reviews[i]) });
  });
  // Records past their retention period have expired; drop them from the index too.
  if (expired.length) await redis.exec([["ZREM", submissionKeys.index(KIND), ...expired]]);
  return out;
}

/** The full record, including the résumé file. */
export async function getCandidate(redis: Redis, id: string): Promise<(Candidate & { record: StoredSubmission }) | null> {
  if (!isCandidateId(id)) return null;
  const [raw, review] = await redis.exec([["GET", submissionKeys.record(KIND, id)], ["GET", reviewKey(id)]]);
  const record = parse<StoredSubmission>(raw);
  if (!record) return null;
  return { id, receivedAt: record.receivedAt, data: record.data, review: parse<CandidateReview>(review), record };
}

export async function saveReview(redis: Redis, id: string, review: CandidateReview): Promise<boolean> {
  if (!isCandidateId(id)) return false;
  const [ttl] = (await redis.exec([["TTL", submissionKeys.record(KIND, id)]])) as [number];
  if (ttl === -2) return false; // the application no longer exists
  await redis.exec([["SET", reviewKey(id), JSON.stringify(review), "EX", ttl > 0 ? ttl : RETENTION_SECONDS[KIND]]]);
  return true;
}

/** Permanently removes the application, its résumé, and the review (e.g. a candidate's deletion request). */
export async function deleteCandidate(redis: Redis, id: string): Promise<void> {
  if (!isCandidateId(id)) return;
  await redis.exec([
    ["DEL", submissionKeys.record(KIND, id), submissionKeys.summary(KIND, id), reviewKey(id)],
    ["ZREM", submissionKeys.index(KIND), id],
  ]);
}
