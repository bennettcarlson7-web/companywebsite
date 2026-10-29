import { z } from "zod";
import { clean, consentField, emailField, nameField, singleLine, toFieldErrors, type SubmissionResponse } from "./shared";

/** Customer project inquiry. Shared between the client form (instant feedback) and the server (source of truth). */

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

export const INQUIRY_LIMITS = {
  name: 100,
  email: 254,
  company: 120,
  descriptionMin: 20,
  descriptionMax: 5000,
} as const;

const optionalEnum = <T extends [string, ...string[]]>(opts: T) =>
  z.union([z.enum(opts), z.literal("")]).optional().transform((v) => (v ? v : undefined));

export const inquirySchema = z.object({
  name: nameField(INQUIRY_LIMITS.name),
  email: emailField(INQUIRY_LIMITS.email, "work email"),
  company: z
    .string()
    .optional()
    .transform((v) => (v ? singleLine(v) : ""))
    .pipe(z.string().max(INQUIRY_LIMITS.company, { error: `Please keep this under ${INQUIRY_LIMITS.company} characters.` }))
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
        .min(INQUIRY_LIMITS.descriptionMin, {
          error: `Please add a bit more detail (at least ${INQUIRY_LIMITS.descriptionMin} characters).`,
        })
        .max(INQUIRY_LIMITS.descriptionMax, {
          error: `Please keep your description under ${INQUIRY_LIMITS.descriptionMax.toLocaleString("en-US")} characters.`,
        }),
    ),
  consent: consentField("Please confirm we can use your details to respond to your inquiry."),
});

export type InquiryInput = z.input<typeof inquirySchema>;
export type Inquiry = z.output<typeof inquirySchema>;
export type InquiryField = keyof Inquiry;
export type InquiryFieldErrors = Partial<Record<InquiryField, string>>;
export type InquiryResponse = SubmissionResponse<InquiryFieldErrors>;

export const inquiryFieldErrors = (error: z.ZodError) => toFieldErrors<InquiryField>(error);
