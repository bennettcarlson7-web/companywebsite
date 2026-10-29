import { z } from "zod";
import { jobs } from "@/content/jobs";
import { clean, consentField, emailField, nameField, singleLine, toFieldErrors, type SubmissionResponse } from "./shared";

/** Candidate job application. Deliberately separate from the project-inquiry schema. */

export const APPLICATION_LIMITS = {
  name: 100,
  email: 254,
  introMin: 50,
  introMax: 3000,
  url: 300,
} as const;

const jobSlugs = jobs.map((j) => j.slug) as [string, ...string[]];

/**
 * Optional public link: https only, no embedded credentials, a real hostname, bounded length.
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
  introduction: z
    .string({ error: "Please write a short introduction." })
    .transform(clean)
    .pipe(
      z
        .string()
        .min(APPLICATION_LIMITS.introMin, {
          error: `Please write a little more (at least ${APPLICATION_LIMITS.introMin} characters).`,
        })
        .max(APPLICATION_LIMITS.introMax, {
          error: `Please keep your introduction under ${APPLICATION_LIMITS.introMax.toLocaleString("en-US")} characters.`,
        }),
    ),
  linkedinUrl: safeLink("LinkedIn", {
    test: (h) => h === "linkedin.com" || h.endsWith(".linkedin.com"),
    message: "Please enter a linkedin.com profile link.",
  }),
  portfolioUrl: safeLink("portfolio or GitHub"),
  resumeUrl: safeLink("résumé"),
  consent: consentField("Please confirm we can use your details to review your application."),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
export type Application = z.output<typeof applicationSchema>;
export type ApplicationField = keyof Application;
export type ApplicationFieldErrors = Partial<Record<ApplicationField, string>>;
export type ApplicationResponse = SubmissionResponse<ApplicationFieldErrors>;

export const applicationFieldErrors = (error: z.ZodError) => toFieldErrors<ApplicationField>(error);
