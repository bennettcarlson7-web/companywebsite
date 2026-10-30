"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import { CircleCheck, Copy, FileText, Mail, TriangleAlert, Upload, X } from "lucide-react";
import {
  APPLICATION_LIMITS,
  applicationFieldErrors,
  applicationSchema,
  ageRangeOptions,
  genderOptions,
  RESUME_ACCEPT,
  type Application,
  type ApplicationField,
  type ApplicationFieldErrors,
} from "@/lib/validation/job-application";
import { brandWithEntity, emailSubjects, mailtoHref } from "@/lib/site-config";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { ErrorSummary, FailureMessage, Field, Honeypot, inputProps, RequiredNote, SubmitButton, useIntakeSubmission } from "./form-kit";

const fieldOrder: ApplicationField[] = [
  "role",
  "name",
  "email",
  "phone",
  "city",
  "country",
  "linkedinUrl",
  "resume",
  "videoUrl",
  "portfolioUrl",
  "gender",
  "ageRange",
  "consent",
];
const fieldLabels: Record<ApplicationField, string> = {
  role: "Role",
  name: "Name",
  email: "Email",
  phone: "Phone",
  city: "City",
  country: "Country",
  gender: "Gender",
  ageRange: "Age range",
  resume: "Résumé",
  videoUrl: "Candidate Introduction Video",
  linkedinUrl: "LinkedIn",
  portfolioUrl: "Portfolio or GitHub",
  consent: "Consent",
};

const VIDEO_HINT =
  "Please record a 1–2 minute video introducing yourself, highlighting your professional background, relevant experience, and why you're interested in joining our team.";

export type RoleOption = { slug: string; title: string };

const titleOf = (roles: RoleOption[], slug?: string) => roles.find((r) => r.slug === slug)?.title;

function applicationEmailSubject(roles: RoleOption[], roleSlug?: string): string {
  return emailSubjects.application(titleOf(roles, roleSlug) || "General interest");
}

const fileSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function summaryText(a: Application, roles: RoleOption[]) {
  return [
    `Role: ${titleOf(roles, a.role) ?? a.role}`,
    `Name: ${a.name}`,
    `Email: ${a.email}`,
    `Phone: ${a.phone}`,
    `Location: ${a.city}, ${a.country}`,
    `Résumé: ${a.resume.filename} (please attach it to your email)`,
    `Introduction video: ${a.videoUrl ?? "Not provided"}`,
    `LinkedIn: ${a.linkedinUrl}`,
    `Portfolio / GitHub: ${a.portfolioUrl ?? "Not provided"}`,
  ].join("\n");
}

/** File → base64 (without the data: URL prefix). */
function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function FormSection({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-6 border-t border-line pt-8 first-of-type:border-t-0 first-of-type:pt-0">
      <h3 className="flex items-center gap-3 text-lg font-semibold text-navy-900">
        <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-cobalt-50 text-sm font-bold text-cobalt-700 ring-1 ring-cobalt-100">
          {step}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

// Read ?role= on the client without making the page dynamic: the server renders no preselection, and the
// select remounts with the requested role right after hydration (before anyone can interact with it).
const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};
const getSearch = () => window.location.search;
const getServerSearch = () => "";

/** `hiringEmail` is used only behind "email" links and the fallback; it's never printed on the page. */
export function CandidateApplicationForm({
  hiringEmail,
  countries,
  roles,
}: {
  hiringEmail: string;
  /** Country picker options, named on the server so server and browser render identical text. */
  countries: { code: string; name: string }[];
  /** Roles currently accepting applications (managed in the admin area). */
  roles: RoleOption[];
}) {
  const formId = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const requested = new URLSearchParams(search).get("role") ?? "";
  const presetRole = titleOf(roles, requested) ? requested : "";
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const role = selectedRole ?? presetRole;

  const { status, setStatus, retryAfter, submit, resetAttempt } = useIntakeSubmission<ApplicationFieldErrors>("/api/apply");
  const [errors, setErrors] = useState<ApplicationFieldErrors>({});
  const [submitted, setSubmitted] = useState<Application | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [country, setCountry] = useState("");
  const resumeInput = useRef<HTMLInputElement>(null);

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
    const file = resumeFile && resumeFile.size > 0 ? resumeFile : null;
    let resume: { name: string; data: string } | undefined;
    const fileError =
      file && file.size > APPLICATION_LIMITS.resumeBytes ? "Please keep your résumé under 3 MB." : undefined;
    if (file && !fileError) {
      try {
        resume = { name: file.name, data: await readAsBase64(file) };
      } catch {
        resume = { name: file.name, data: "" };
      }
    }
    const raw = {
      role: String(fd.get("role") ?? ""),
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      city: String(fd.get("city") ?? ""),
      country: String(fd.get("country") ?? ""),
      gender: String(fd.get("gender") ?? ""),
      ageRange: String(fd.get("ageRange") ?? ""),
      resume,
      videoUrl: String(fd.get("videoUrl") ?? ""),
      linkedinUrl: String(fd.get("linkedinUrl") ?? ""),
      portfolioUrl: String(fd.get("portfolioUrl") ?? ""),
      consent: fd.get("consent") === "on",
    };

    const parsed = applicationSchema.safeParse(raw);
    if (!parsed.success || fileError) {
      showErrors({ ...(parsed.success ? {} : applicationFieldErrors(parsed.error)), ...(fileError ? { resume: fileError } : {}) });
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


  if (status === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="rounded-2xl bg-success-50 p-8 ring-1 ring-success-700/20 outline-none">
        <CircleCheck aria-hidden="true" className="size-10 text-success-700" />
        <h2 className="mt-4 text-2xl font-semibold">Thanks — we received your application.</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          Your application for <strong>{titleOf(roles, submitted?.role)}</strong> is with our team. We&apos;ll reply
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
    <a href={mailtoHref(hiringEmail, applicationEmailSubject(roles, role))} className="font-medium underline">
      email your application instead
    </a>
  );

  return (
    <>
      {showUnconfigured && (
        <UnconfiguredPanel resultRef={resultRef} application={submitted} hiringEmail={hiringEmail} roles={roles} onBack={() => setStatus("idle")} />
      )}
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

        <FormSection step={1} title="About you">
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
              {roles.map((j) => (
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

          <Field id={fid("phone")} label="Phone" required hint="Include your country code, e.g. +63 917 123 4567" error={errors.phone}>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+"
              maxLength={APPLICATION_LIMITS.phone}
              required
              {...inputProps(fid("phone"), errors.phone)}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field id={fid("city")} label="City" required error={errors.city}>
              <input name="city" type="text" autoComplete="address-level2" maxLength={APPLICATION_LIMITS.city} required {...inputProps(fid("city"), errors.city)} />
            </Field>
            <Field id={fid("country")} label="Country" required error={errors.country}>
              <select
                name="country"
                required
                autoComplete="country"
                value={country}
                onChange={(e) => setCountry(e.currentTarget.value)}
                {...inputProps(fid("country"), errors.country, country === "US" ? fid("country-note") : undefined)}
              >
                <option value="" disabled>
                  Choose a country…
                </option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {country === "US" && (
                <p id={fid("country-note")} className="mt-2 text-sm text-warning-800">
                  Please note: our current roles are open to candidates based outside the United States.
                </p>
              )}
            </Field>
          </div>

          <Field id={fid("linkedinUrl")} label="LinkedIn profile" required hint="https://www.linkedin.com/in/…" error={errors.linkedinUrl}>
            <input
              name="linkedinUrl"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://www.linkedin.com/in/"
              required
              maxLength={APPLICATION_LIMITS.url}
              {...inputProps(fid("linkedinUrl"), errors.linkedinUrl)}
            />
          </Field>
        </FormSection>

        <FormSection step={2} title="Résumé">
          <Field id={fid("resume")} label="Upload your résumé" required hint="PDF or Word (.pdf, .doc, .docx) · up to 3 MB" error={errors.resume}>
            <div
              className={cn(
                "relative rounded-2xl border-2 border-dashed bg-paper p-6 text-center transition-colors focus-within:border-cobalt-600 focus-within:ring-2 focus-within:ring-cobalt-600/25 hover:border-cobalt-300",
                errors.resume ? "border-danger-600" : "border-line-strong",
              )}
            >
              {resumeFile ? (
                <div className="flex items-center justify-between gap-4 text-left">
                  <span className="flex min-w-0 items-center gap-3">
                    <FileText aria-hidden="true" className="size-8 shrink-0 text-cobalt-700" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-navy-900">{resumeFile.name}</span>
                      <span className="block text-sm text-slate-600">{fileSize(resumeFile.size)}</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeFile(null);
                      if (resumeInput.current) resumeInput.current.value = "";
                      resetAttempt();
                    }}
                    className={buttonClasses({ variant: "ghost", className: "relative z-10 shrink-0" })}
                  >
                    <X aria-hidden="true" className="size-4" />
                    Remove<span className="sr-only"> {resumeFile.name}</span>
                  </button>
                </div>
              ) : (
                <div aria-hidden="true">
                  <Upload className="mx-auto size-8 text-cobalt-700" />
                  <p className="mt-2 font-medium text-navy-900">
                    <span className="text-cobalt-700 underline underline-offset-2">Choose a file</span> or drag it here
                  </p>
                  <p className="mt-1 text-sm text-slate-600">PDF, DOC or DOCX · max 3 MB</p>
                </div>
              )}
              <input
                ref={resumeInput}
                id={fid("resume")}
                name="resume"
                type="file"
                accept={RESUME_ACCEPT}
                required
                aria-invalid={errors.resume ? true : undefined}
                aria-describedby={[`${fid("resume")}-hint`, errors.resume ? `${fid("resume")}-error` : null].filter(Boolean).join(" ")}
                onChange={(e) => setResumeFile(e.currentTarget.files?.[0] ?? null)}
                className={cn("absolute inset-0 size-full cursor-pointer opacity-0", resumeFile && "pointer-events-none")}
              />
            </div>
          </Field>
        </FormSection>

        <FormSection step={3} title="Candidate Introduction Video (optional)">
          <Field
            id={fid("videoUrl")}
            label="Video link"
            hint={`Optional. ${VIDEO_HINT} Paste a link to it (YouTube unlisted, Loom, Google Drive, etc.) and make sure anyone with the link can view it.`}
            error={errors.videoUrl}
          >
            <input
              name="videoUrl"
              type="url"
              inputMode="url"
              placeholder="https://"
              maxLength={APPLICATION_LIMITS.url}
              {...inputProps(fid("videoUrl"), errors.videoUrl)}
            />
          </Field>
        </FormSection>

        <FormSection step={4} title="Your work (optional)">
          <Field id={fid("portfolioUrl")} label="Portfolio or GitHub" hint="Optional" error={errors.portfolioUrl}>
            <input name="portfolioUrl" type="url" inputMode="url" maxLength={APPLICATION_LIMITS.url} {...inputProps(fid("portfolioUrl"), errors.portfolioUrl)} />
          </Field>
        </FormSection>

        <FormSection step={5} title="Voluntary self-identification (optional)">
          <p className="-mt-2 text-sm leading-relaxed text-slate-600">
            Answering is completely voluntary, and choosing &ldquo;Decline to self-identify&rdquo; has no effect on your
            application. Your answers are not used to make hiring decisions. If you answer, they are included with your
            application.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id={fid("gender")} label="Gender" hint="Optional" error={errors.gender}>
              <select name="gender" defaultValue="" {...inputProps(fid("gender"), errors.gender)}>
                <option value="">Decline to self-identify</option>
                {genderOptions
                  .filter((o) => o.value !== "decline")
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
              </select>
            </Field>
            <Field id={fid("ageRange")} label="Age range" hint="Optional" error={errors.ageRange}>
              <select name="ageRange" defaultValue="" {...inputProps(fid("ageRange"), errors.ageRange)}>
                <option value="">Decline to self-identify</option>
                {ageRangeOptions
                  .filter((o) => o.value !== "decline")
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
        </FormSection>

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
              I agree that {brandWithEntity()} may use the information I&apos;ve shared to review my application and contact
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
  roles,
  onBack,
}: {
  resultRef: RefObject<HTMLDivElement | null>;
  application: Application;
  hiringEmail: string;
  roles: RoleOption[];
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const text = summaryText(application, roles);
  const mailto = mailtoHref(hiringEmail, applicationEmailSubject(roles, application.role), text.slice(0, 1800));

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
      <h2 className="mt-4 text-xl font-semibold">We couldn&apos;t send your application from the website</h2>
      <p className="mt-2 leading-relaxed text-warning-800">
        Your application has not been sent yet. Your details are ready below — send them to our hiring team by email
        with one click, or copy them into your own email. Please attach your résumé to that email.
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
