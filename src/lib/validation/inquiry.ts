import { z } from "zod";

/** Shared between the client form (for instant feedback) and the server (the source of truth). */

export const projectTypes = [
  { value: "mvp", label: "New product / MVP" },
  { value: "custom-software", label: "Custom software or internal tool" },
  { value: "web-mobile", label: "Web or mobile app" },
  { value: "ai-automation", label: "AI or workflow automation" },
  { value: "integration", label: "Integration or modernization" },
  { value: "dedicated-team", label: "Dedicated engineering team" },
  { value: "other", label: "Something else" },
] as const;

export const budgetRanges = [
  { value: "under-25k", label: "Under $25k" },
  { value: "25k-50k", label: "$25k – $50k" },
  { value: "50k-100k", label: "$50k – $100k" },
  { value: "100k-plus", label: "$100k+" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const timelines = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3-months", label: "Within 1–3 months" },
  { value: "3-6-months", label: "Within 3–6 months" },
  { value: "exploring", label: "Just exploring" },
] as const;

type Values<T extends readonly { value: string }[]> = T[number]["value"];
const values = <T extends readonly { value: string }[]>(opts: T) =>
  opts.map((o) => o.value) as [Values<T>, ...Values<T>[]];

export const LIMITS = {
  name: 100,
  email: 254,
  company: 120,
  descriptionMin: 20,
  descriptionMax: 5000,
  /** Raw request body cap, in bytes. Comfortably above the sum of field limits. */
  bodyBytes: 16_384,
  /** Submissions faster than this after the form rendered are treated as automated. */
  minFillMs: 2500,
} as const;

// Strip control characters (keeps \n and \t in the description).
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
const singleLine = (s: string) => clean(s).replace(/[\r\n\t]+/g, " ");

const optionalEnum = <T extends [string, ...string[]]>(opts: T) =>
  z.union([z.enum(opts), z.literal("")]).optional().transform((v) => (v ? v : undefined));

export const inquirySchema = z.object({
  name: z
    .string({ error: "Please enter your name." })
    .transform(singleLine)
    .pipe(
      z
        .string()
        .min(2, { error: "Please enter your name." })
        .max(LIMITS.name, { error: `Please keep your name under ${LIMITS.name} characters.` }),
    ),
  email: z
    .string({ error: "Please enter your work email." })
    .transform(singleLine)
    .pipe(
      z
        .email({ error: "Please enter a valid email address, like name@company.com." })
        .max(LIMITS.email, { error: "That email address is too long." }),
    ),
  company: z
    .string()
    .optional()
    .transform((v) => (v ? singleLine(v) : ""))
    .pipe(z.string().max(LIMITS.company, { error: `Please keep this under ${LIMITS.company} characters.` }))
    .transform((v) => v || undefined),
  projectType: z.enum(values(projectTypes), { error: "Please choose a project type." }),
  budget: optionalEnum(values(budgetRanges)),
  timeline: optionalEnum(values(timelines)),
  description: z
    .string({ error: "Please tell us a little about your project." })
    .transform(clean)
    .pipe(
      z
        .string()
        .min(LIMITS.descriptionMin, {
          error: `Please add a bit more detail (at least ${LIMITS.descriptionMin} characters).`,
        })
        .max(LIMITS.descriptionMax, {
          error: `Please keep your description under ${LIMITS.descriptionMax.toLocaleString("en-US")} characters.`,
        }),
    ),
  consent: z.literal(true, { error: "Please confirm we can use your details to respond to your inquiry." }),
});

export type InquiryInput = z.input<typeof inquirySchema>;
export type Inquiry = z.output<typeof inquirySchema>;
export type InquiryField = keyof Inquiry;
export type FieldErrors = Partial<Record<InquiryField, string>>;

/** First error message per field, in a shape the form can render directly. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) out[key as InquiryField] = issue.message;
  }
  return out;
}

export function labelFor<T extends readonly { value: string; label: string }[]>(opts: T, value?: string): string {
  return opts.find((o) => o.value === value)?.label ?? "Not specified";
}

/** Envelope sent by the client: the inquiry plus anti-abuse signals. */
export const envelopeSchema = z.object({
  inquiry: z.record(z.string(), z.unknown()),
  /** Honeypot. Real visitors never see or fill this field. */
  website: z.string().max(200).optional(),
  /** Milliseconds between form render and submit. */
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type InquiryResponse =
  | { status: "sent" }
  | { status: "invalid"; fieldErrors: FieldErrors }
  | { status: "unconfigured" }
  | { status: "rate_limited"; retryAfterSeconds: number }
  | { status: "rejected" }
  | { status: "error" };
