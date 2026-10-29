import { getJob } from "@/content/jobs";
import { emailSubjects, siteConfig } from "@/lib/site-config";
import { applicationFieldErrors, applicationSchema, type Application, type ApplicationResponse } from "@/lib/validation/job-application";
import { isApplicationDeliveryConfigured, type IntakeEnv } from "./env";
import type { RateLimiter } from "./rate-limit";
import { renderNotificationHtml, sendEmail } from "./email";
import { DeliveredSubmissions, defaultLogger, guardSubmission, type Logger, type SubmissionRequest } from "./submission-guard";

export type ApplicationDeps = {
  env: IntakeEnv;
  limiter: RateLimiter;
  fetchImpl?: typeof fetch;
  log?: Logger;
  delivered?: DeliveredSubmissions;
};

export type ApplicationResult = { httpStatus: number; body: ApplicationResponse; headers?: Record<string, string> };

const deliveredApplications = new DeliveredSubmissions();

export function applicationSubject(roleTitle: string): string {
  return emailSubjects.application(roleTitle);
}

export function formatApplicationText(app: Application): string {
  const role = getJob(app.role)?.title ?? app.role;
  return [
    `Role: ${role}`,
    `Name: ${app.name}`,
    `Email: ${app.email}`,
    `LinkedIn: ${app.linkedinUrl ?? "Not provided"}`,
    `Portfolio / GitHub: ${app.portfolioUrl ?? "Not provided"}`,
    `Résumé link: ${app.resumeUrl ?? "Not provided"}`,
    "",
    "Introduction:",
    app.introduction,
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
      ["LinkedIn", app.linkedinUrl ?? "Not provided"],
      ["Portfolio / GitHub", app.portfolioUrl ?? "Not provided"],
      ["Résumé link", app.resumeUrl ?? "Not provided"],
    ],
    "Introduction",
    app.introduction,
    `Sent from the ${siteConfig.name} careers application form. Candidate data: restrict access to the hiring team and follow the documented retention policy.`,
  );
  return { subject: applicationSubject(role), html, text: formatApplicationText(app) };
}

/** Candidate application: shared guard → application schema → email to the hiring inbox only. */
export async function handleApplication(req: SubmissionRequest, deps: ApplicationDeps): Promise<ApplicationResult> {
  const log = deps.log ?? defaultLogger("application");
  const delivered = deps.delivered ?? deliveredApplications;

  const guard = await guardSubmission(req, { namespace: "application", limiter: deps.limiter, log });
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

  if (!isApplicationDeliveryConfigured(deps.env)) {
    log({ outcome: "unconfigured", role: parsed.data.role });
    return { httpStatus: 503, body: { status: "unconfigured" } };
  }

  const { subject, html, text } = buildApplicationEmail(parsed.data);
  const result = await sendEmail({ to: deps.env.hiringTo, replyTo: parsed.data.email, subject, html, text }, deps.env, deps.fetchImpl);
  if (!result.ok) {
    log({ outcome: "delivery_failure", failures: [result.detail ?? "email"], role: parsed.data.role });
    return { httpStatus: 502, body: { status: "error" } };
  }

  delivered.add(guard.submissionId);
  log({ outcome: "sent", role: parsed.data.role });
  return { httpStatus: 200, body: { status: "sent" } };
}
