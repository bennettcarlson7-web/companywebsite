"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { defaultJobPosting } from "@/content/jobs";
import { readAdminConfig } from "@/lib/admin/config";
import { requestLoginCode, verifyLoginCode } from "@/lib/admin/login-codes";
import { endSession, requireAdmin, startSession } from "@/lib/admin/session";
import { candidateStatuses, deleteCandidate, saveReview, type CandidateStatus } from "@/lib/data/candidates";
import { JOBS_TAG, readJobs, writeJobs, type JobStatus, type ManagedJob } from "@/lib/data/jobs";
import { createRedis, type Redis } from "@/lib/data/redis";
import { readIntakeEnv } from "@/lib/integrations/env";
import { clientIp } from "@/lib/integrations/http";
import { jobPostingFieldErrors, jobPostingSchema, uniqueSlug, type JobPostingErrors } from "@/lib/validation/job-posting";
import { clean } from "@/lib/validation/shared";

/**
 * Admin Server Actions. Every action except sign-in starts with `requireAdmin()` — the session is verified on the
 * server for each call, never trusted from the page. Next.js also rejects cross-site action calls (Origin check).
 * Logs carry outcomes and record IDs only, never candidate details.
 */

const log = (e: Record<string, unknown>) => console.info(JSON.stringify({ event: "admin", ...e }));

function storage(): Redis {
  const redis = createRedis(readIntakeEnv());
  if (!redis) throw new Error("Storage isn't configured for this environment.");
  return redis;
}

// ---- Sign-in -------------------------------------------------------------------------------------------------

export type LoginState = { step: "email" | "code"; email?: string; message?: string; error?: string };

const GENERIC_SENT =
  "If this address has admin access, we've emailed it a 6-digit code. It expires in 10 minutes — check spam if you don't see it.";

export async function requestCodeAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { step: "email", error: "Please enter a valid email address." };

  const env = readIntakeEnv();
  const result = await requestLoginCode(email, clientIp(await headers()), { redis: createRedis(env), env, config: readAdminConfig() });
  log({ action: "request_code", outcome: result });
  if (result === "rate_limited") return { step: "email", email, error: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  if (result === "disabled") return { step: "email", error: "Admin sign-in isn't set up for this website yet." };
  // "sent", "not_admin", and "email_failed" look the same, so the form can't be used to discover admin addresses.
  return { step: "code", email, message: GENERIC_SENT };
}

export async function verifyCodeAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  const ok = await verifyLoginCode(email, code, { redis: createRedis(readIntakeEnv()), config: readAdminConfig() });
  log({ action: "verify_code", outcome: ok ? "signed_in" : "rejected" });
  if (!ok) return { step: "code", email, error: "That code is incorrect or has expired. Check the latest email, or request a new code." };
  await startSession(email);
  redirect("/admin/candidates");
}

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

// ---- Candidates ----------------------------------------------------------------------------------------------

export type ReviewState = { saved?: boolean; error?: string };

export async function saveCandidateReviewAction(id: string, _prev: ReviewState, form: FormData): Promise<ReviewState> {
  const admin = await requireAdmin();
  const status = String(form.get("status") ?? "") as CandidateStatus;
  if (!candidateStatuses.some((s) => s.value === status)) return { error: "Please choose a status." };
  const notes = clean(String(form.get("notes") ?? "")).slice(0, 5000);
  const ok = await saveReview(storage(), id, { status, notes, updatedAt: new Date().toISOString(), updatedBy: admin.email });
  log({ action: "save_review", id, outcome: ok ? "saved" : "not_found" });
  if (!ok) return { error: "This application no longer exists." };
  refresh();
  return { saved: true };
}

export async function deleteCandidateAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteCandidate(storage(), id);
  log({ action: "delete_candidate", id, outcome: "deleted" });
  redirect("/admin/candidates?deleted=1");
}

// ---- Roles ---------------------------------------------------------------------------------------------------

export type JobFormState = { errors?: JobPostingErrors; error?: string };

export async function saveJobAction(slug: string | null, _prev: JobFormState, form: FormData): Promise<JobFormState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries([...form].filter(([k, v]) => !k.startsWith("$") && typeof v === "string")) as Record<string, string>;
  const parsed = jobPostingSchema.safeParse(raw);
  if (!parsed.success) return { errors: jobPostingFieldErrors(parsed.error), error: "Please fix the highlighted fields." };
  const p = parsed.data;

  const redis = storage();
  const jobs = await readJobs(redis);
  const now = new Date().toISOString();
  const facts = {
    location: p.location,
    workplace: p.location && /remote/i.test(p.location) ? "Remote" : null,
    employmentType: p.employmentType,
    compensation: p.compensation,
  };
  const content = {
    title: p.title,
    shortTitle: p.shortTitle ?? p.title,
    team: p.team,
    summary: p.summary,
    overview: p.overview,
    workOn: p.workOn,
    lookingFor: p.lookingFor,
    niceToHave: p.niceToHave,
    skills: p.skills,
    facts,
  };

  let saved: ManagedJob;
  if (slug) {
    const i = jobs.findIndex((j) => j.slug === slug);
    if (i < 0) return { error: "This role no longer exists." };
    // The slug never changes after posting, so shared links and applications keep pointing at the role.
    saved = jobs[i] = { ...jobs[i]!, ...content, updatedAt: now, updatedBy: admin.email };
  } else {
    const status: JobStatus = form.get("publish") === "on" ? "open" : "closed";
    saved = {
      slug: uniqueSlug(p.title, jobs.map((j) => j.slug)),
      ...content,
      posting: defaultJobPosting,
      status,
      createdAt: now,
      updatedAt: now,
      updatedBy: admin.email,
    };
    jobs.push(saved);
  }
  await writeJobs(redis, jobs);
  updateTag(JOBS_TAG);
  log({ action: slug ? "update_job" : "create_job", slug: saved.slug, status: saved.status });
  redirect(`/admin/roles?saved=${encodeURIComponent(saved.slug)}`);
}

export async function setJobStatusAction(slug: string, status: JobStatus): Promise<void> {
  const admin = await requireAdmin();
  if (status !== "open" && status !== "closed") return;
  const redis = storage();
  const jobs = await readJobs(redis);
  const job = jobs.find((j) => j.slug === slug);
  if (!job) return;
  Object.assign(job, { status, updatedAt: new Date().toISOString(), updatedBy: admin.email });
  await writeJobs(redis, jobs);
  updateTag(JOBS_TAG);
  log({ action: status === "open" ? "reopen_job" : "withdraw_job", slug });
  refresh();
}
