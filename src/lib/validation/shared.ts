import { z } from "zod";

/** Limits and helpers shared by every public form. Field-level schemas live in their own modules. */
export const SUBMISSION_LIMITS = {
  /** Raw request body cap, in bytes. Comfortably above the sum of any form's field limits. */
  bodyBytes: 16_384,
  /** Applications carry a base64 résumé (≤ 3 MB → ~4 MB encoded); stays under Vercel's 4.5 MB request cap. */
  applicationBodyBytes: 4_400_000,
  /** Submissions faster than this after the form rendered are treated as automated. */
  minFillMs: 2500,
} as const;

// Strip control characters (keeps \n and \t for multi-line fields).
export const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
/** Single-line fields: also collapse line breaks, which rules out email header injection. */
export const singleLine = (s: string) => clean(s).replace(/[\r\n\t]+/g, " ");

export const nameField = (max: number) =>
  z
    .string({ error: "Please enter your name." })
    .transform(singleLine)
    .pipe(
      z
        .string()
        .min(2, { error: "Please enter your name." })
        .max(max, { error: `Please keep your name under ${max} characters.` }),
    );

export const emailField = (max = 254, label = "email") =>
  z
    .string({ error: `Please enter your ${label}.` })
    .transform(singleLine)
    .pipe(
      z
        .email({ error: "Please enter a valid email address, like name@company.com." })
        .max(max, { error: "That email address is too long." }),
    );

export const consentField = (message: string) => z.literal(true, { error: message });

/** First error message per field, in a shape forms can render directly. */
export function toFieldErrors<K extends string>(error: z.ZodError): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) out[key as K] = issue.message;
  }
  return out;
}

export function labelFor<T extends readonly { value: string; label: string }[]>(opts: T, value?: string): string {
  return opts.find((o) => o.value === value)?.label ?? "Not specified";
}

/** Envelope sent by every form: the field payload plus anti-abuse signals. */
export const envelopeSchema = z.object({
  payload: z.record(z.string(), z.unknown()),
  /** Honeypot. Real visitors never see or fill this field. */
  website: z.string().max(200).optional(),
  /** Milliseconds between form render and submit. */
  elapsedMs: z.number().int().nonnegative().optional(),
  /** Random per-attempt ID so a double-submitted form isn't delivered twice. */
  submissionId: z.uuid().optional(),
});

export type SubmissionResponse<F> =
  | { status: "sent" }
  | { status: "invalid"; fieldErrors: F }
  | { status: "unconfigured" }
  | { status: "rate_limited"; retryAfterSeconds: number }
  | { status: "rejected" }
  | { status: "error" };
