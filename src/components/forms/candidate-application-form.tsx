"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type RefObject } from "react";
import Link from "next/link";
import { CircleCheck, Copy, Mail, TriangleAlert } from "lucide-react";
import { getJob, getJobs } from "@/content/jobs";
import {
  APPLICATION_LIMITS,
  applicationFieldErrors,
  applicationSchema,
  type Application,
  type ApplicationField,
  type ApplicationFieldErrors,
} from "@/lib/validation/job-application";
import { emailSubjects, mailtoHref, siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";
import { buttonClasses } from "@/components/ui/button";
import { ErrorSummary, FailureMessage, Field, Honeypot, inputProps, RequiredNote, SubmitButton, useIntakeSubmission } from "./form-kit";

const fieldOrder: ApplicationField[] = ["role", "name", "email", "introduction", "linkedinUrl", "portfolioUrl", "resumeUrl", "consent"];
const fieldLabels: Record<ApplicationField, string> = {
  role: "Role",
  name: "Name",
  email: "Email",
  introduction: "Introduction",
  linkedinUrl: "LinkedIn",
  portfolioUrl: "Portfolio or GitHub",
  resumeUrl: "Résumé link",
  consent: "Consent",
};

function applicationEmailSubject(roleSlug?: string): string {
  return emailSubjects.application((roleSlug && getJob(roleSlug)?.title) || "General interest");
}

function summaryText(a: Application) {
  return [
    `Role: ${getJob(a.role)?.title ?? a.role}`,
    `Name: ${a.name}`,
    `Email: ${a.email}`,
    `LinkedIn: ${a.linkedinUrl ?? "Not provided"}`,
    `Portfolio / GitHub: ${a.portfolioUrl ?? "Not provided"}`,
    `Résumé link: ${a.resumeUrl ?? "Not provided"}`,
    "",
    a.introduction,
  ].join("\n");
}

// Read ?role= on the client without making the page dynamic: the server renders no preselection, and the
// select remounts with the requested role right after hydration (before anyone can interact with it).
const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};
const getSearch = () => window.location.search;
const getServerSearch = () => "";

export function CandidateApplicationForm({ deliveryConfigured, hiringEmail }: { deliveryConfigured: boolean; hiringEmail: string }) {
  const formId = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const requested = new URLSearchParams(search).get("role") ?? "";
  const presetRole = getJob(requested) ? requested : "";
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const role = selectedRole ?? presetRole;

  const { status, setStatus, retryAfter, submit, resetAttempt } = useIntakeSubmission<ApplicationFieldErrors>("/api/apply");
  const [errors, setErrors] = useState<ApplicationFieldErrors>({});
  const [submitted, setSubmitted] = useState<Application | null>(null);
  const [introLength, setIntroLength] = useState(0);

  useEffect(() => {
    if (status === "sent" || status === "unconfigured") resultRef.current?.focus();
  }, [status]);

  const fid = (name: string) => `${formId}-${name}`;
  const showErrors = (e: ApplicationFieldErrors) => {
    setErrors(e);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const fd = new FormData(e.currentTarget);
    const raw = {
      role: String(fd.get("role") ?? ""),
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      introduction: String(fd.get("introduction") ?? ""),
      linkedinUrl: String(fd.get("linkedinUrl") ?? ""),
      portfolioUrl: String(fd.get("portfolioUrl") ?? ""),
      resumeUrl: String(fd.get("resumeUrl") ?? ""),
      consent: fd.get("consent") === "on",
    };

    const parsed = applicationSchema.safeParse(raw);
    if (!parsed.success) {
      showErrors(applicationFieldErrors(parsed.error));
      setStatus("invalid");
      return;
    }
    setErrors({});
    setSubmitted(parsed.data);

    const result = await submit(raw, String(fd.get("website") ?? ""));
    if (!result) return;
    if (result.status === "invalid") showErrors(result.fieldErrors);
    track({ name: "job_application_submitted", props: { outcome: result.status, role: parsed.data.role } });
  }

  const roleTitle = getJob(role)?.title;

  if (status === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="rounded-2xl bg-success-50 p-8 ring-1 ring-success-700/20 outline-none">
        <CircleCheck aria-hidden="true" className="size-10 text-success-700" />
        <h2 className="mt-4 text-2xl font-semibold">Thanks — we received your application.</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          Your application for <strong>{getJob(submitted?.role ?? "")?.title}</strong> is with our team. We&apos;ll reply
          to <strong>{submitted?.email}</strong>. We read every application, though we can&apos;t promise an interview.
        </p>
        <Link href="/careers" className={buttonClasses({ variant: "secondary", className: "mt-6" })}>
          Back to Careers
        </Link>
      </div>
    );
  }

  const showUnconfigured = status === "unconfigured" && submitted !== null;
  const emailFallback = (
    <>
      email your application to{" "}
      <a href={mailtoHref(hiringEmail, applicationEmailSubject(role))} className="font-medium underline">
        {hiringEmail}
      </a>
    </>
  );

  return (
    <>
      {showUnconfigured && (
        <UnconfiguredPanel resultRef={resultRef} application={submitted} hiringEmail={hiringEmail} onBack={() => setStatus("idle")} />
      )}
      <form
        onSubmit={onSubmit}
        onChange={resetAttempt}
        noValidate
        hidden={showUnconfigured}
        aria-describedby={fid("required-note")}
        className="relative space-y-6"
      >
        {!deliveryConfigured && (
          <div className="flex gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>Online applications aren&apos;t switched on yet.</strong> Please email{" "}
              <a href={mailtoHref(hiringEmail, applicationEmailSubject(role))} className="font-semibold underline">
                {hiringEmail}
              </a>{" "}
              with the role in the subject line. You can still fill in this form — we&apos;ll turn it into a ready-to-send
              email instead of pretending it was sent.
            </p>
          </div>
        )}

        <ErrorSummary summaryRef={summaryRef} idPrefix={formId} errors={errors} order={fieldOrder} labels={fieldLabels} />
        <RequiredNote id={fid("required-note")} />

        <Field id={fid("role")} label="Role" required error={errors.role}>
          <select
            name="role"
            required
            value={role}
            onChange={(e) => setSelectedRole(e.currentTarget.value)}
            {...inputProps(fid("role"), errors.role)}
          >
            <option value="" disabled>
              Choose a role…
            </option>
            {getJobs().map((j) => (
              <option key={j.slug} value={j.slug}>
                {j.title}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={fid("name")} label="Name" required error={errors.name}>
            <input name="name" type="text" autoComplete="name" maxLength={APPLICATION_LIMITS.name} required {...inputProps(fid("name"), errors.name)} />
          </Field>
          <Field id={fid("email")} label="Email" required error={errors.email}>
            <input name="email" type="email" autoComplete="email" inputMode="email" maxLength={APPLICATION_LIMITS.email} required {...inputProps(fid("email"), errors.email)} />
          </Field>
        </div>

        <Field
          id={fid("introduction")}
          label="Introduce yourself"
          required
          hint={`A few sentences is plenty: what you've worked on recently${roleTitle ? `, and why the ${roleTitle} role interests you` : ", and which kind of work interests you"}.`}
          error={errors.introduction}
        >
          <textarea
            name="introduction"
            rows={6}
            required
            maxLength={APPLICATION_LIMITS.introMax}
            onChange={(e) => setIntroLength(e.currentTarget.value.length)}
            {...inputProps(fid("introduction"), errors.introduction, fid("intro-count"))}
          />
          <p id={fid("intro-count")} className="mt-1.5 text-right text-xs text-slate-600">
            {introLength.toLocaleString("en-US")} / {APPLICATION_LIMITS.introMax.toLocaleString("en-US")}
          </p>
        </Field>

        <fieldset className="space-y-6 rounded-2xl bg-paper p-5 ring-1 ring-line">
          <legend className="px-1 text-sm font-semibold text-navy-900">Links (optional)</legend>
          <p className="-mt-3 text-sm text-slate-600">
            Share whatever best shows your work. Please use links rather than attachments — we don&apos;t accept file
            uploads.
          </p>
          <Field id={fid("linkedinUrl")} label="LinkedIn profile" hint="Optional · https://www.linkedin.com/in/…" error={errors.linkedinUrl}>
            <input name="linkedinUrl" type="url" inputMode="url" autoComplete="url" maxLength={APPLICATION_LIMITS.url} {...inputProps(fid("linkedinUrl"), errors.linkedinUrl)} />
          </Field>
          <Field id={fid("portfolioUrl")} label="Portfolio or GitHub" hint="Optional" error={errors.portfolioUrl}>
            <input name="portfolioUrl" type="url" inputMode="url" maxLength={APPLICATION_LIMITS.url} {...inputProps(fid("portfolioUrl"), errors.portfolioUrl)} />
          </Field>
          <Field id={fid("resumeUrl")} label="Résumé link" hint="Optional · a view-only link to a PDF or doc (Google Drive, Dropbox, etc.)" error={errors.resumeUrl}>
            <input name="resumeUrl" type="url" inputMode="url" maxLength={APPLICATION_LIMITS.url} {...inputProps(fid("resumeUrl"), errors.resumeUrl)} />
          </Field>
        </fieldset>

        <Honeypot id={fid("website")} />

        <div>
          <div className="flex gap-3">
            <input
              id={fid("consent")}
              name="consent"
              type="checkbox"
              required
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? `${fid("consent")}-error` : undefined}
              className="mt-0.5 size-5 shrink-0 rounded border-line-strong accent-cobalt-600"
            />
            <label htmlFor={fid("consent")} className="text-sm leading-relaxed text-slate-700">
              I agree that {siteConfig.name} may use the information I&apos;ve shared to review my application and contact
              me about it, as described in the{" "}
              <a href="/privacy" className="font-medium text-cobalt-700 underline underline-offset-2">
                Privacy Policy
              </a>
              . I can ask for it to be deleted at any time. <span aria-hidden="true" className="text-danger-600">*</span>
            </label>
          </div>
          {errors.consent && (
            <p id={`${fid("consent")}-error`} className="mt-2 text-sm text-danger-700">
              {errors.consent}
            </p>
          )}
        </div>

        <FailureMessage status={status} retryAfter={retryAfter} emailFallback={emailFallback} what="application" />
        <SubmitButton pending={status === "submitting"} label="Submit Application" />
      </form>
    </>
  );
}

function UnconfiguredPanel({
  resultRef,
  application,
  hiringEmail,
  onBack,
}: {
  resultRef: RefObject<HTMLDivElement | null>;
  application: Application;
  hiringEmail: string;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const text = summaryText(application);
  const mailto = mailtoHref(hiringEmail, applicationEmailSubject(application.role), text.slice(0, 1800));

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  }

  return (
    <div ref={resultRef} tabIndex={-1} className="rounded-2xl bg-warning-50 p-6 ring-1 ring-warning-200 outline-none sm:p-8">
      <TriangleAlert aria-hidden="true" className="size-8 text-warning-800" />
      <h2 className="mt-4 text-xl font-semibold">Your application has not been sent</h2>
      <p className="mt-2 leading-relaxed text-warning-800">
        Online applications aren&apos;t switched on yet, so nothing was submitted. Your details are ready below — send
        them to <strong>{hiringEmail}</strong> with one click, or copy them into your own email.
      </p>
      <label htmlFor="application-summary" className="mt-5 block text-sm font-semibold text-navy-900">
        Your application summary
      </label>
      <textarea
        id="application-summary"
        readOnly
        value={text}
        rows={9}
        className="mt-2 block w-full rounded-xl border border-warning-200 bg-white p-3 font-mono text-sm text-navy-900"
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a href={mailto} className={buttonClasses()}>
          <Mail aria-hidden="true" className="size-4" />
          Send by Email
        </a>
        <button type="button" onClick={copy} className={buttonClasses({ variant: "secondary" })}>
          <Copy aria-hidden="true" className="size-4" />
          {copied === "copied" ? "Copied" : "Copy Summary"}
        </button>
        <button type="button" onClick={onBack} className={buttonClasses({ variant: "ghost" })}>
          Edit Details
        </button>
      </div>
      <p aria-live="polite" className="mt-3 text-sm text-warning-800">
        {copied === "copied" && "Summary copied to your clipboard."}
        {copied === "failed" && "Couldn't copy automatically — select the text above and copy it manually."}
      </p>
    </div>
  );
}
