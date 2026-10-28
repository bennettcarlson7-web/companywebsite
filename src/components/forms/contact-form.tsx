"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type Ref } from "react";
import { CircleAlert, CircleCheck, Copy, LoaderCircle, Mail, TriangleAlert } from "lucide-react";
import {
  budgetRanges,
  inquirySchema,
  labelFor,
  LIMITS,
  projectTypes,
  timelines,
  toFieldErrors,
  type FieldErrors,
  type Inquiry,
  type InquiryField,
  type InquiryResponse,
} from "@/lib/validation/inquiry";
import { siteConfig } from "@/lib/site-config";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | InquiryResponse["status"] | "network";

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

export function ContactForm({
  deliveryConfigured,
  contactEmail,
}: {
  /** Build-time hint so visitors know up front; the server response is authoritative. */
  deliveryConfigured: boolean;
  contactEmail: string | null;
}) {
  const formId = useId();
  const mountedAt = useRef<number | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState<Inquiry | null>(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const [descLength, setDescLength] = useState(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "sent" || status === "unconfigured") resultRef.current?.focus();
  }, [status]);

  const fid = (name: string) => `${formId}-${name}`;
  const errorCount = Object.keys(errors).length;

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
      setErrors(toFieldErrors(parsed.error));
      setStatus("invalid");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setErrors({});
    setStatus("submitting");
    setSubmitted(parsed.data);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiry: raw,
          website: String(fd.get("website") ?? ""),
          elapsedMs: mountedAt.current ? Date.now() - mountedAt.current : 0,
        }),
      });
      const body = (await res.json().catch(() => ({ status: "error" }))) as InquiryResponse;
      if (body.status === "invalid") {
        setErrors(body.fieldErrors);
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
      if (body.status === "rate_limited") setRetryAfter(body.retryAfterSeconds);
      setStatus(body.status);
    } catch {
      setStatus("network");
    }
  }

  if (status === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="rounded-2xl bg-success-50 p-8 ring-1 ring-success-700/20 outline-none">
        <CircleCheck aria-hidden="true" className="size-10 text-success-700" />
        <h2 className="mt-4 text-2xl font-semibold">Thanks — we received your inquiry.</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          We&apos;ll review the details and reply to <strong>{submitted?.email}</strong>.{" "}
          {siteConfig.contact.responseTime}
        </p>
      </div>
    );
  }

  const showUnconfigured = status === "unconfigured" && submitted !== null;

  return (
    <>
    {showUnconfigured && (
      <UnconfiguredPanel ref={resultRef} inquiry={submitted} contactEmail={contactEmail} onBack={() => setStatus("idle")} />
    )}
    {/* Kept mounted (just hidden) while the summary shows, so "Edit Details" keeps what was typed. */}
    <form onSubmit={onSubmit} noValidate hidden={showUnconfigured} aria-describedby={fid("required-note")} className="space-y-6">
      {!deliveryConfigured && (
        <div className="flex gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            <strong>Demo mode:</strong> online delivery for this form isn&apos;t connected yet. You can still fill it
            in — we&apos;ll give you a ready-to-send summary{contactEmail ? " and an email link" : ""} instead of
            pretending it was sent.
          </p>
        </div>
      )}

      {errorCount > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby={fid("error-title")}
          className="rounded-xl border border-danger-600/30 bg-danger-50 p-4 outline-none"
        >
          <p id={fid("error-title")} className="flex items-center gap-2 font-semibold text-danger-700">
            <CircleAlert aria-hidden="true" className="size-4" />
            Please fix {errorCount === 1 ? "1 problem" : `${errorCount} problems`} before sending:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-danger-700">
            {fieldOrder
              .filter((f) => errors[f])
              .map((f) => (
                <li key={f}>
                  <a href={`#${fid(f)}`} className="underline underline-offset-2">
                    {fieldLabels[f]}: {errors[f]}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}

      <p id={fid("required-note")} className="text-sm text-slate-600">
        Fields marked <span aria-hidden="true" className="text-danger-600">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={fid("name")} label="Name" required error={errors.name}>
          <input name="name" type="text" autoComplete="name" maxLength={LIMITS.name} required {...inputProps(fid("name"), errors.name)} />
        </Field>
        <Field id={fid("email")} label="Work email" required error={errors.email}>
          <input name="email" type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} required {...inputProps(fid("email"), errors.email)} />
        </Field>
        <Field id={fid("company")} label="Company" hint="Optional" error={errors.company}>
          <input name="company" type="text" autoComplete="organization" maxLength={LIMITS.company} {...inputProps(fid("company"), errors.company)} />
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
          maxLength={LIMITS.descriptionMax}
          onChange={(e) => setDescLength(e.currentTarget.value.length)}
          {...inputProps(fid("description"), errors.description, fid("description-count"))}
        />
        <p id={fid("description-count")} className="mt-1.5 text-right text-xs text-slate-600" aria-live="polite">
          {descLength.toLocaleString("en-US")} / {LIMITS.descriptionMax.toLocaleString("en-US")}
        </p>
      </Field>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill every field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={fid("website")}>Leave this field empty</label>
        <input id={fid("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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
            I agree that {siteConfig.name} may use the information I&apos;ve shared to respond to this inquiry, as
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

      <StatusMessage status={status} retryAfter={retryAfter} contactEmail={contactEmail} />

      <button type="submit" disabled={status === "submitting"} className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}>
        {status === "submitting" ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Inquiry"
        )}
      </button>
    </form>
    </>
  );
}

function inputProps(id: string, error?: string, extraDescribedBy?: string) {
  const describedBy = [`${id}-hint`, error ? `${id}-error` : null, extraDescribedBy].filter(Boolean).join(" ");
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: cn(
      "block w-full rounded-xl border bg-white px-4 py-3 text-base text-navy-900 shadow-sm transition-colors placeholder:text-slate-500 focus:border-cobalt-600 focus:ring-2 focus:ring-cobalt-600/25 focus:outline-none",
      error ? "border-danger-600" : "border-line-strong hover:border-cobalt-300",
    ),
  } as const;
}

function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-navy-900">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger-600">
            *
          </span>
        )}
      </label>
      <p id={`${id}-hint`} className={cn("mt-1 text-sm text-slate-600", !hint && "sr-only")}>
        {hint ?? (required ? "Required" : "")}
      </p>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-sm text-danger-700">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function StatusMessage({ status, retryAfter, contactEmail }: { status: Status; retryAfter: number; contactEmail: string | null }) {
  const fallback = contactEmail ? (
    <>
      {" "}
      You can also email us at{" "}
      <a href={`mailto:${contactEmail}`} className="font-medium underline">
        {contactEmail}
      </a>
      .
    </>
  ) : null;

  const messages: Partial<Record<Status, ReactNode>> = {
    rate_limited: (
      <>
        You&apos;ve sent several inquiries in a short time. Please try again in about{" "}
        {Math.max(1, Math.ceil(retryAfter / 60))} minute{retryAfter > 60 ? "s" : ""}.{fallback}
      </>
    ),
    error: <>Something went wrong on our side and your inquiry was not sent. Your details are still here — please try again.{fallback}</>,
    network: <>We couldn&apos;t reach the server. Check your connection and try again — your details are still here.{fallback}</>,
    rejected: <>We couldn&apos;t accept this submission. Please reload the page and try again.{fallback}</>,
  };
  const message = messages[status];

  return (
    <div aria-live="polite" role="status">
      {message && (
        <p className="flex gap-2 rounded-xl border border-danger-600/30 bg-danger-50 p-4 text-sm text-danger-700">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{message}</span>
        </p>
      )}
    </div>
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
  contactEmail: string | null;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const text = summaryText(inquiry);
  const mailto = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`Project inquiry from ${inquiry.name}`)}&body=${encodeURIComponent(text.slice(0, 1800))}`
    : null;

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
      <h2 className="mt-4 text-xl font-semibold">Your inquiry has not been sent</h2>
      <p className="mt-2 leading-relaxed text-warning-800">
        Online delivery for this form isn&apos;t connected yet, so nothing was submitted. Your details passed validation
        and are ready below — {mailto ? "send them by email or copy them" : "copy them"} so nothing is lost.
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
        {mailto && (
          <a href={mailto} className={buttonClasses()}>
            <Mail aria-hidden="true" className="size-4" />
            Send by Email
          </a>
        )}
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
      {!contactEmail && (
        <p className="mt-2 text-sm text-warning-800">
          A public contact email hasn&apos;t been published yet. Please check back soon.
        </p>
      )}
    </div>
  );
}
