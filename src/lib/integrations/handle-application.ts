import { getJob } from "@/content/jobs";
import { emailSubjects, siteConfig } from "@/lib/site-config";
import { countryName } from "@/lib/countries";
import {
  applicationFieldErrors,
  applicationSchema,
  genderOptions,
  type Application,
  type ApplicationResponse,
} from "@/lib/validation/job-application";
import { labelFor, SUBMISSION_LIMITS } from "@/lib/validation/shared";
import { isApplicationDeliveryConfigured, type IntakeEnv } from "./env";
import type { RateLimiter } from "./rate-limit";
import { renderNotificationHtml, sendEmail, type SmtpSender } from "./email";
import { buildApplicationConfirmation, sendConfirmation } from "./confirmation";
import { saveSubmission, type SubmissionStore } from "./submission-store";
import { DeliveredSubmissions, defaultLogger, guardSubmission, type Logger, type SubmissionRequest } from "./submission-guard";

export type ApplicationDeps = {
  env: IntakeEnv;
  limiter: RateLimiter;
  fetchImpl?: typeof fetch;
  /** Test hook: replaces the real SMTP transport. */
  smtpSender?: SmtpSender;
  /** Where accepted applications are saved. Without one, delivery depends on email alone. */
  store?: SubmissionStore;
  log?: Logger;
  delivered?: DeliveredSubmissions;
};

export type ApplicationResult = { httpStatus: number; body: ApplicationResponse; headers?: Record<string, string> };

const deliveredApplications = new DeliveredSubmissions();

export function applicationSubject(roleTitle: string): string {
  return emailSubjects.application(roleTitle);
}

const fileSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const resumeLabel = (app: Application) => `${app.resume.filename} (${fileSize(app.resume.size)}, attached)`;
const locationLabel = (app: Application) => `${app.city}, ${countryName(app.country)}`;
const genderLabel = (app: Application) => (app.gender === "decline" ? "Not disclosed" : labelFor(genderOptions, app.gender));

// The age range is voluntary self-identification kept out of reviewer-facing email (saved with the record only).
export function formatApplicationText(app: Application): string {
  const role = getJob(app.role)?.title ?? app.role;
  return [
    `Role: ${role}`,
    `Name: ${app.name}`,
    `Email: ${app.email}`,
    `Phone: ${app.phone}`,
    `Location: ${locationLabel(app)}`,
    `Gender: ${genderLabel(app)}`,
    `Résumé: ${resumeLabel(app)}`,
    `Introduction video: ${app.videoUrl}`,
    `LinkedIn: ${app.linkedinUrl}`,
    `Portfolio / GitHub: ${app.portfolioUrl ?? "Not provided"}`,
  ].join("\n");
}

export function buildApplicationEmail(app: Application) {
  const role = getJob(app.role)?.title ?? app.role;
  // Links are shown as escaped plain text (not anchors) so reviewers see exactly what was submitted.
  const html = renderNotificationHtml(
    `New application: ${role}`,
    [
      ["Role", role],
      ["Name", app.name],
      ["Email", app.email],
      ["Phone", app.phone],
      ["Location", locationLabel(app)],
      ["Gender", genderLabel(app)],
      ["Résumé", resumeLabel(app)],
      ["LinkedIn", app.linkedinUrl],
      ["Portfolio / GitHub", app.portfolioUrl ?? "Not provided"],
    ],
    "Introduction video",
    app.videoUrl,
    `Sent from the ${siteConfig.name} careers application form. Candidate data: restrict access to the hiring team and follow the documented retention policy.`,
  );
  const attachments = [{ filename: app.resume.filename, contentType: app.resume.contentType, content: app.resume.data }];
  return { subject: applicationSubject(role), html, text: formatApplicationText(app), attachments };
}

/** Candidate application: shared guard → application schema → saved + emailed to the hiring inbox (never the CRM). */
export async function handleApplication(req: SubmissionRequest, deps: ApplicationDeps): Promise<ApplicationResult> {
  const log = deps.log ?? defaultLogger("application");
  const delivered = deps.delivered ?? deliveredApplications;

  const guard = await guardSubmission(req, {
    namespace: "application",
    limiter: deps.limiter,
    log,
    maxBodyBytes: SUBMISSION_LIMITS.applicationBodyBytes,
  });
  if (!guard.ok) return { httpStatus: guard.httpStatus, body: guard.body, headers: guard.headers };

  const parsed = applicationSchema.safeParse(guard.payload);
  if (!parsed.success) {
    log({ outcome: "invalid" });
    return { httpStatus: 422, body: { status: "invalid", fieldErrors: applicationFieldErrors(parsed.error) } };
  }

  if (delivered.has(guard.submissionId)) {
    log({ outcome: "duplicate_ignored", role: parsed.data.role });
    return { httpStatus: 200, body: { status: "sent" } };
  }

  const emailConfigured = isApplicationDeliveryConfigured(deps.env);
  if (!deps.store && !emailConfigured) {
    log({ outcome: "unconfigured", role: parsed.data.role });
    return { httpStatus: 503, body: { status: "unconfigured" } };
  }

  // Like an ATS: save the application (résumé file included) first; email is a notification on top, with the
  // résumé attached. Either one means we have it.
  const stored = await saveSubmission(deps.store, {
    id: guard.submissionId ?? crypto.randomUUID(),
    kind: "application",
    receivedAt: new Date().toISOString(),
    data: { ...parsed.data, roleTitle: getJob(parsed.data.role)?.title ?? parsed.data.role, countryName: countryName(parsed.data.country) },
  });
  let emailed: Awaited<ReturnType<typeof sendEmail>> | null = null;
  if (emailConfigured) {
    const { subject, html, text, attachments } = buildApplicationEmail(parsed.data);
    emailed = await sendEmail(
      { to: deps.env.hiringTo, replyTo: parsed.data.email, subject, html, text, attachments },
      deps.env,
      deps.fetchImpl,
      deps.smtpSender,
    );
  }

  const failures = [stored, emailed].filter((r) => r && !r.ok).map((r) => r!.detail ?? "error");
  if (failures.length) log({ outcome: "delivery_failure", failures, role: parsed.data.role });
  if (!stored?.ok && !emailed?.ok) return { httpStatus: 502, body: { status: "error" } };

  delivered.add(guard.submissionId);
  log({ outcome: "sent", role: parsed.data.role, channels: [stored?.ok && "store", emailed?.ok && "email"].filter(Boolean) });
  if (!emailed?.ok) return { httpStatus: 200, body: { status: "sent" } };

  const roleTitle = getJob(parsed.data.role)?.title ?? parsed.data.role;
  const confirmation = await sendConfirmation(
    buildApplicationConfirmation(parsed.data.name, parsed.data.email, roleTitle, deps.env),
    deps.env,
    deps.fetchImpl,
    deps.smtpSender,
  );
  if (confirmation) {
    log({
      outcome: confirmation.ok ? "confirmation_sent" : "confirmation_failed",
      role: parsed.data.role,
      failures: confirmation.detail ? [confirmation.detail] : undefined,
    });
  }
  return { httpStatus: 200, body: { status: "sent" } };
}
