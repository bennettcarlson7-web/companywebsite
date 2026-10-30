import { z } from "zod";
import { countryCodes } from "@/lib/countries";
import { consentField, emailField, nameField, singleLine, toFieldErrors, type SubmissionResponse } from "./shared";

/** Candidate job application. Deliberately separate from the project-inquiry schema. */

export const APPLICATION_LIMITS = {
  name: 100,
  email: 254,
  phone: 25,
  city: 100,
  url: 300,
  /** Résumé file cap. Base64 adds a third, and Vercel caps request bodies at 4.5 MB. */
  resumeBytes: 3 * 1024 * 1024,
  resumeName: 120,
} as const;

export const RESUME_ACCEPT = ".pdf,.doc,.docx";

/**
 * Accepted résumé formats, identified by the file's leading bytes (as base64), never by the browser's claimed type.
 * The extension must agree with the detected format.
 */
const resumeFormats = [
  { ext: ".pdf", contentType: "application/pdf", magic: "JVBERi" }, // %PDF
  { ext: ".docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", magic: "UEsDB" }, // PK\x03\x04
  { ext: ".doc", contentType: "application/msword", magic: "0M8R4KGx" }, // OLE compound file
] as const;

const base64Bytes = (b64: string) => Math.floor((b64.length * 3) / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);

const resumeField = z
  .object(
    { name: z.string(), data: z.string() },
    { error: "Please attach your résumé (PDF or Word, up to 3 MB)." },
  )
  .transform((v, ctx) => {
    const filename = singleLine(v.name).replace(/[\\/"<>:|?*]/g, "_").slice(-APPLICATION_LIMITS.resumeName);
    const format = resumeFormats.find((f) => filename.toLowerCase().endsWith(f.ext));
    if (!format) {
      ctx.addIssue({ code: "custom", message: "Please upload your résumé as a PDF or Word file (.pdf, .doc, .docx)." });
      return z.NEVER;
    }
    if (!v.data || !/^[A-Za-z0-9+/]+={0,2}$/.test(v.data)) {
      ctx.addIssue({ code: "custom", message: "We couldn't read that file. Please choose it again." });
      return z.NEVER;
    }
    const size = base64Bytes(v.data);
    if (size > APPLICATION_LIMITS.resumeBytes) {
      ctx.addIssue({ code: "custom", message: "Please keep your résumé under 3 MB." });
      return z.NEVER;
    }
    if (!v.data.startsWith(format.magic)) {
      ctx.addIssue({ code: "custom", message: `That file doesn't look like a real ${format.ext} document. Please check it and try again.` });
      return z.NEVER;
    }
    return { filename, contentType: format.contentType, size, data: v.data };
  });

/** URL-safe role identifier. Whether the role is open is checked on the server against the live job list. */
export const roleSlugField = z
  .string({ error: "Please choose the role you're applying for." })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: "Please choose the role you're applying for." })
  .max(100);

/** Voluntary self-identification. Empty or "decline" both mean the candidate chose not to answer. */
export const genderOptions = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non-binary", label: "Non-binary" },
  { value: "another", label: "Another gender identity" },
  { value: "decline", label: "Decline to self-identify" },
] as const;

export const ageRangeOptions = [
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45-54", label: "45–54" },
  { value: "55-64", label: "55–64" },
  { value: "65+", label: "65 or older" },
  { value: "decline", label: "Decline to self-identify" },
] as const;

const optionalChoice = <T extends readonly { value: string }[]>(opts: T, message: string) =>
  z
    .string()
    .optional()
    .transform((v) => v || "decline")
    .pipe(z.enum(opts.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]], { error: message }));

/** International phone: digits with optional +, spaces, dashes, dots, and parentheses; 7–15 digits (E.164 max). */
const phoneField = z
  .string({ error: "Please enter your phone number." })
  .transform(singleLine)
  .superRefine((v, ctx) => {
    if (!v) return void ctx.addIssue({ code: "custom", message: "Please enter your phone number." });
    const digits = v.replace(/\D/g, "").length;
    if (!/^\+?[\d\s().-]+$/.test(v) || digits < 7 || digits > 15 || v.length > APPLICATION_LIMITS.phone) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid phone number with country code, like +63 917 123 4567." });
    }
  });

/**
 * Public link (optional unless piped into a required string): https only, no embedded credentials, a real hostname, bounded length.
 * Links are rendered as escaped text in notification emails, so a malicious URL can't execute anything,
 * but restricting the scheme also rules out `javascript:`, `data:`, and `file:` links outright.
 */
const safeLink = (label: string, hostCheck?: { test: (host: string) => boolean; message: string }) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? singleLine(v) : ""))
    .superRefine((v, ctx) => {
      if (!v) return;
      if (v.length > APPLICATION_LIMITS.url) {
        ctx.addIssue({ code: "custom", message: `Please use a shorter ${label} link.` });
        return;
      }
      let url: URL;
      try {
        url = new URL(v);
      } catch {
        ctx.addIssue({ code: "custom", message: `Please enter a full ${label} link starting with https://` });
        return;
      }
      if (url.protocol !== "https:") {
        ctx.addIssue({ code: "custom", message: `Please use a secure (https://) ${label} link.` });
      } else if (url.username || url.password || !url.hostname.includes(".")) {
        ctx.addIssue({ code: "custom", message: `Please enter a valid ${label} link.` });
      } else if (hostCheck && !hostCheck.test(url.hostname.toLowerCase())) {
        ctx.addIssue({ code: "custom", message: hostCheck.message });
      }
    })
    .transform((v) => v || undefined);

export const applicationSchema = z.object({
  name: nameField(APPLICATION_LIMITS.name),
  email: emailField(APPLICATION_LIMITS.email),
  phone: phoneField,
  city: z
    .string({ error: "Please enter the city you live in." })
    .transform(singleLine)
    .pipe(
      z
        .string()
        .min(2, { error: "Please enter the city you live in." })
        .max(APPLICATION_LIMITS.city, { error: `Please keep the city under ${APPLICATION_LIMITS.city} characters.` }),
    ),
  country: z.enum(countryCodes as [string, ...string[]], { error: "Please choose the country you live in." }),
  gender: optionalChoice(genderOptions, "Please choose one of the listed options."),
  ageRange: optionalChoice(ageRangeOptions, "Please choose one of the listed options."),
  role: roleSlugField,
  resume: resumeField,
  videoUrl: safeLink("video").pipe(z.string({ error: "Please add a link to your 1–2 minute introduction video." })),
  linkedinUrl: safeLink("LinkedIn", {
    test: (h) => h === "linkedin.com" || h.endsWith(".linkedin.com"),
    message: "Please enter a linkedin.com profile link.",
  }).pipe(z.string({ error: "Please add your LinkedIn profile link." })),
  portfolioUrl: safeLink("portfolio or GitHub"),
  consent: consentField("Please confirm we can use your details to review your application."),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
export type Application = z.output<typeof applicationSchema>;
export type ApplicationField = keyof Application;
export type ApplicationFieldErrors = Partial<Record<ApplicationField, string>>;
export type ApplicationResponse = SubmissionResponse<ApplicationFieldErrors>;

export const applicationFieldErrors = (error: z.ZodError) => toFieldErrors<ApplicationField>(error);
