"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type Ref } from "react";
import { CircleCheck, Copy, Mail, TriangleAlert } from "lucide-react";
import { labelFor } from "@/lib/validation/shared";
import {
  budgetRanges,
  INQUIRY_LIMITS,
  inquiryFieldErrors,
  inquirySchema,
  projectTypes,
  timelines,
  type Inquiry,
  type InquiryField,
  type InquiryFieldErrors,
} from "@/lib/validation/project-inquiry";
import { brandWithEntity, emailSubjects, mailtoHref, siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";
import { buttonClasses } from "@/components/ui/button";
import { ErrorSummary, FailureMessage, Field, Honeypot, inputProps, RequiredNote, SubmitButton, useIntakeSubmission } from "./form-kit";

const fieldOrder: InquiryField[] = ["name", "email", "company", "projectType", "budget", "timeline", "description", "consent"];
const fieldLabels: Record<InquiryField, string> = {
  name: "Name",
  email: "Work email",
  company: "Company",
  projectType: "Project type",
  budget: "Budget range",
  timeline: "Timeline",
  description: "Project description",
  consent: "Consent",
};

function summaryText(i: Inquiry) {
  return [
    `Name: ${i.name}`,
    `Email: ${i.email}`,
    `Company: ${i.company ?? "Not provided"}`,
    `Project type: ${labelFor(projectTypes, i.projectType)}`,
    `Budget: ${labelFor(budgetRanges, i.budget)}`,
    `Timeline: ${labelFor(timelines, i.timeline)}`,
    "",
    i.description,
  ].join("\n");
}

/** Customer project inquiry form. Posts to /api/inquiry; never shows success unless the server confirms delivery. */
export function ProjectInquiryForm({
  contactEmail,
}: {
  /** Used only behind "email us" links and the fallback; never printed on the page. */
  contactEmail: string;
}) {
  const formId = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { status, setStatus, retryAfter, submit, resetAttempt } = useIntakeSubmission<InquiryFieldErrors>("/api/inquiry");
  const [errors, setErrors] = useState<InquiryFieldErrors>({});
  const [submitted, setSubmitted] = useState<Inquiry | null>(null);
  const [descLength, setDescLength] = useState(0);

  useEffect(() => {
    if (status === "sent" || status === "unconfigured") resultRef.current?.focus();
  }, [status]);

  const fid = (name: string) => `${formId}-${name}`;
  const showErrors = (e: InquiryFieldErrors) => {
    setErrors(e);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      projectType: String(fd.get("projectType") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      timeline: String(fd.get("timeline") ?? ""),
      description: String(fd.get("description") ?? ""),
      consent: fd.get("consent") === "on",
    };

    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) {
      showErrors(inquiryFieldErrors(parsed.error));
      setStatus("invalid");
      return;
    }
    setErrors({});
    setSubmitted(parsed.data);

    const result = await submit(raw, String(fd.get("website") ?? ""));
    if (!result) return;
    if (result.status === "invalid") showErrors(result.fieldErrors);
    track({ name: "project_inquiry_submitted", props: { outcome: result.status, projectType: parsed.data.projectType } });
  }

  if (status === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="rounded-2xl bg-success-50 p-8 ring-1 ring-success-700/20 outline-none">
        <CircleCheck aria-hidden="true" className="size-10 text-success-700" />
        <h2 className="mt-4 text-2xl font-semibold">Thanks — we received your inquiry.</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          We&apos;ll review the details and reply to <strong>{submitted?.email}</strong>. {siteConfig.contact.responseTime}
        </p>
      </div>
    );
  }

  const showUnconfigured = status === "unconfigured" && submitted !== null;
  const emailFallback = (
    <a href={mailtoHref(contactEmail, emailSubjects.inquiry)} className="font-medium underline">
      email us instead
    </a>
  );

  return (
    <>
      {showUnconfigured && (
        <UnconfiguredPanel ref={resultRef} inquiry={submitted} contactEmail={contactEmail} onBack={() => setStatus("idle")} />
      )}
      {/* Kept mounted (just hidden) while the summary shows, so "Edit Details" keeps what was typed. */}
      <form
        onSubmit={onSubmit}
        onChange={resetAttempt}
        noValidate
        hidden={showUnconfigured}
        aria-describedby={fid("required-note")}
        className="relative space-y-6"
      >
        <ErrorSummary summaryRef={summaryRef} idPrefix={formId} errors={errors} order={fieldOrder} labels={fieldLabels} />
        <RequiredNote id={fid("required-note")} />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={fid("name")} label="Name" required error={errors.name}>
            <input name="name" type="text" autoComplete="name" maxLength={INQUIRY_LIMITS.name} required {...inputProps(fid("name"), errors.name)} />
          </Field>
          <Field id={fid("email")} label="Work email" required error={errors.email}>
            <input name="email" type="email" autoComplete="email" inputMode="email" maxLength={INQUIRY_LIMITS.email} required {...inputProps(fid("email"), errors.email)} />
          </Field>
          <Field id={fid("company")} label="Company" hint="Optional" error={errors.company}>
            <input name="company" type="text" autoComplete="organization" maxLength={INQUIRY_LIMITS.company} {...inputProps(fid("company"), errors.company)} />
          </Field>
          <Field id={fid("projectType")} label="Project type" required error={errors.projectType}>
            <select name="projectType" required defaultValue="" {...inputProps(fid("projectType"), errors.projectType)}>
              <option value="" disabled>
                Choose one…
              </option>
              {projectTypes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={fid("budget")} label="Approximate budget" hint="Optional — helps us suggest the right scope" error={errors.budget}>
            <select name="budget" defaultValue="" {...inputProps(fid("budget"), errors.budget)}>
              <option value="">Prefer not to say</option>
              {budgetRanges.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={fid("timeline")} label="Timeline" hint="Optional" error={errors.timeline}>
            <select name="timeline" defaultValue="" {...inputProps(fid("timeline"), errors.timeline)}>
              <option value="">Not sure</option>
              {timelines.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id={fid("description")}
          label="Tell us about your project"
          required
          hint="What are you building, who is it for, and what does success look like? Please don't include passwords or sensitive personal data."
          error={errors.description}
        >
          <textarea
            name="description"
            rows={6}
            required
            maxLength={INQUIRY_LIMITS.descriptionMax}
            onChange={(e) => setDescLength(e.currentTarget.value.length)}
            {...inputProps(fid("description"), errors.description, fid("description-count"))}
          />
          <p id={fid("description-count")} className="mt-1.5 text-right text-xs text-slate-600">
            {descLength.toLocaleString("en-US")} / {INQUIRY_LIMITS.descriptionMax.toLocaleString("en-US")}
          </p>
        </Field>

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
              I agree that {brandWithEntity()} may use the information I&apos;ve shared to respond to this inquiry, as
              described in the{" "}
              <a href="/privacy" className="font-medium text-cobalt-700 underline underline-offset-2">
                Privacy Policy
              </a>
              . <span aria-hidden="true" className="text-danger-600">*</span>
            </label>
          </div>
          {errors.consent && (
            <p id={`${fid("consent")}-error`} className="mt-2 text-sm text-danger-700">
              {errors.consent}
            </p>
          )}
        </div>

        <FailureMessage status={status} retryAfter={retryAfter} emailFallback={emailFallback} what="inquiry" />
        <SubmitButton pending={status === "submitting"} label="Send Inquiry" />
      </form>
    </>
  );
}

function UnconfiguredPanel({
  ref,
  inquiry,
  contactEmail,
  onBack,
}: {
  ref: Ref<HTMLDivElement>;
  inquiry: Inquiry;
  contactEmail: string;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const text = summaryText(inquiry);
  const mailto = mailtoHref(contactEmail, `${emailSubjects.inquiry}: ${inquiry.name}`, text.slice(0, 1800));

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  }

  return (
    <div ref={ref} tabIndex={-1} className="rounded-2xl bg-warning-50 p-6 ring-1 ring-warning-200 outline-none sm:p-8">
      <TriangleAlert aria-hidden="true" className="size-8 text-warning-800" />
      <h2 className="mt-4 text-xl font-semibold">We couldn&apos;t send your inquiry from the website</h2>
      <p className="mt-2 leading-relaxed text-warning-800">
        Your inquiry has not been sent yet. Your details are ready below — send them to our team by email with one
        click, or copy them into your own email.
      </p>
      <label htmlFor="inquiry-summary" className="mt-5 block text-sm font-semibold text-navy-900">
        Your project summary
      </label>
      <textarea
        id="inquiry-summary"
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
