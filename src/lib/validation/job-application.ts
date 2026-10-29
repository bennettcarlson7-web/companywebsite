import { z } from "zod";
import { jobs } from "@/content/jobs";
import { consentField, emailField, nameField, singleLine, toFieldErrors, type SubmissionResponse } from "./shared";

/** Candidate job application. Deliberately separate from the project-inquiry schema. */

export const APPLICATION_LIMITS = {
  name: 100,
  email: 254,
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

const jobSlugs = jobs.map((j) => j.slug) as [string, ...string[]];

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
  role: z.enum(jobSlugs, { error: "Please choose the role you're applying for." }),
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
