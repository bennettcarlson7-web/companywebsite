import { cacheLife, cacheTag } from "next/cache";
import { seedJobs, type Job } from "@/content/jobs";
import { readIntakeEnv } from "@/lib/integrations/env";
import { createRedis, type Redis } from "./redis";

/**
 * Job postings, managed from the admin area and stored as one JSON document (a small company has a handful of
 * roles, so one atomic read/write keeps this simple). Until the admin saves for the first time, the roles in
 * `src/content/jobs.ts` are the starting data.
 */

export type JobStatus = "open" | "closed";
export type ManagedJob = Job & { status: JobStatus; createdAt: string; updatedAt: string; updatedBy?: string };

export const JOBS_KEY = "jobs:v1";
/** Cache tag for every public page that shows jobs; admin changes call `updateTag(JOBS_TAG)`. */
export const JOBS_TAG = "jobs";

const SEEDED_AT = "2026-10-29T00:00:00.000Z";

export function seedManagedJobs(): ManagedJob[] {
  return seedJobs.map((j) => ({ ...j, status: "open", createdAt: SEEDED_AT, updatedAt: SEEDED_AT }));
}

/** Authoritative, uncached read (admin pages, application checks). Falls back to the seed roles when unsaved. */
export async function readJobs(redis: Redis | undefined): Promise<ManagedJob[]> {
  if (!redis) return seedManagedJobs();
  const [raw] = await redis.exec([["GET", JOBS_KEY]]);
  if (typeof raw !== "string") return seedManagedJobs();
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("jobs_corrupt");
  return parsed as ManagedJob[];
}

export async function writeJobs(redis: Redis, jobs: ManagedJob[]): Promise<void> {
  await redis.exec([["SET", JOBS_KEY, JSON.stringify(jobs)]]);
}

export const isOpen = (j: Pick<ManagedJob, "status">) => j.status === "open";

/**
 * Cached read for public pages: prerendered into static pages, refreshed instantly by `updateTag(JOBS_TAG)`
 * after an admin change, and at most a few minutes stale otherwise.
 */
export async function getAllJobs(): Promise<ManagedJob[]> {
  "use cache";
  cacheTag(JOBS_TAG);
  cacheLife("minutes");
  try {
    return await readJobs(createRedis(readIntakeEnv()));
  } catch (err) {
    console.error(JSON.stringify({ event: "jobs", outcome: "read_failed", detail: err instanceof Error ? err.message : "error" }));
    return seedManagedJobs();
  }
}

export async function getOpenJobs(): Promise<ManagedJob[]> {
  return (await getAllJobs()).filter(isOpen);
}

export async function getJobBySlug(slug: string): Promise<ManagedJob | undefined> {
  return (await getAllJobs()).find((j) => j.slug === slug);
}
