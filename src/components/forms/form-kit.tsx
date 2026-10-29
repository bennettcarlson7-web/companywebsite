"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import type { SubmissionResponse } from "@/lib/validation/shared";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Building blocks shared by the project inquiry and job application forms. */

export type FormStatus<F> = "idle" | "submitting" | SubmissionResponse<F>["status"] | "network";

export function inputProps(id: string, error?: string, extraDescribedBy?: string) {
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

export function Field({
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

export function RequiredNote({ id }: { id: string }) {
  return (
    <p id={id} className="text-sm text-slate-600">
      Fields marked <span aria-hidden="true" className="text-danger-600">*</span>
      <span className="sr-only">with an asterisk</span> are required.
    </p>
  );
}

export function ErrorSummary<K extends string>({
  summaryRef,
  idPrefix,
  errors,
  order,
  labels,
}: {
  summaryRef: RefObject<HTMLDivElement | null>;
  idPrefix: string;
  errors: Partial<Record<K, string>>;
  order: K[];
  labels: Record<K, string>;
}) {
  const keys = order.filter((k) => errors[k]);
  if (keys.length === 0) return null;
  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby={`${idPrefix}-error-title`}
      className="rounded-xl border border-danger-600/30 bg-danger-50 p-4 outline-none"
    >
      <p id={`${idPrefix}-error-title`} className="flex items-center gap-2 font-semibold text-danger-700">
        <CircleAlert aria-hidden="true" className="size-4" />
        Please fix {keys.length === 1 ? "1 problem" : `${keys.length} problems`} before sending:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-danger-700">
        {keys.map((k) => (
          <li key={k}>
            <a href={`#${idPrefix}-${k}`} className="underline underline-offset-2">
              {labels[k]}: {errors[k]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Honeypot: hidden from people and assistive tech; bots tend to fill every field. */
export function Honeypot({ id }: { id: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}>
      {pending ? (
        <>
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Sending…
        </>
      ) : (
        label
      )}
    </button>
  );
}

/** Inline, announced message for failures that keep the form on screen. */
export function FailureMessage({
  status,
  retryAfter,
  emailFallback,
  what,
}: {
  status: string;
  retryAfter: number;
  emailFallback: ReactNode;
  what: string;
}) {
  const messages: Record<string, ReactNode> = {
    rate_limited: (
      <>
        Several {what}s were sent from this connection in a short time. Please try again in about{" "}
        {Math.max(1, Math.ceil(retryAfter / 60))} minute{retryAfter > 60 ? "s" : ""}, or {emailFallback}.
      </>
    ),
    error: <>Something went wrong on our side and your {what} was not sent. Your details are still here — please try again, or {emailFallback}.</>,
    network: <>We couldn&apos;t reach the server, so your {what} was not sent. Check your connection and try again, or {emailFallback}.</>,
    rejected: <>We couldn&apos;t accept this submission. Please reload the page and try again, or {emailFallback}.</>,
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

/**
 * Posts `{ payload, website, elapsedMs, submissionId }` to an intake endpoint and tracks status.
 * The submission ID stays the same across retries of the same attempt (so a lost response can't cause a
 * duplicate email) and is reset after success or when the visitor edits the form.
 */
export function useIntakeSubmission<F>(endpoint: string) {
  const mountedAt = useRef<number | null>(null);
  const submissionId = useRef<string | null>(null);
  const inFlight = useRef(false);
  const [status, setStatus] = useState<FormStatus<F>>("idle");
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const resetAttempt = useCallback(() => {
    submissionId.current = null;
  }, []);

  const submit = useCallback(
    async (payload: Record<string, unknown>, website: string): Promise<SubmissionResponse<F> | { status: "network" } | null> => {
      if (inFlight.current) return null;
      inFlight.current = true;
      submissionId.current ??= typeof crypto.randomUUID === "function" ? crypto.randomUUID() : null;
      setStatus("submitting");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload,
            website,
            elapsedMs: mountedAt.current ? Date.now() - mountedAt.current : 0,
            ...(submissionId.current ? { submissionId: submissionId.current } : {}),
          }),
        });
        const body = (await res.json().catch(() => ({ status: "error" }))) as SubmissionResponse<F>;
        if (body.status === "rate_limited") setRetryAfter(body.retryAfterSeconds);
        if (body.status === "sent") submissionId.current = null;
        setStatus(body.status);
        return body;
      } catch {
        setStatus("network");
        return { status: "network" };
      } finally {
        inFlight.current = false;
      }
    },
    [endpoint],
  );

  return { status, setStatus, retryAfter, submit, resetAttempt };
}
