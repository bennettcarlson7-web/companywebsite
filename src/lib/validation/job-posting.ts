import { z } from "zod";
import { clean, singleLine, toFieldErrors } from "./shared";

/** Admin form for posting or editing a role. Text areas hold one item per line (paragraphs: blank-line separated). */

const line = (label: string, min: number, max: number) =>
  z
    .string({ error: `Please enter the ${label}.` })
    .transform(singleLine)
    .pipe(
      z
        .string()
        .min(min, { error: min > 1 ? `Please enter the ${label} (at least ${min} characters).` : `Please enter the ${label}.` })
        .max(max, { error: `Please keep the ${label} under ${max} characters.` }),
    );

const optionalLine = (label: string, max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? singleLine(v) : ""))
    .pipe(z.string().max(max, { error: `Please keep the ${label} under ${max} characters.` }))
    .transform((v) => v || null);

const items = (label: string, min: number, maxItems: number, maxLen: number, split: RegExp) =>
  z
    .string()
    .optional()
    .transform((v) =>
      clean(v ?? "")
        .split(split)
        .map((s) => singleLine(s).replace(/^[-*•]\s*/, ""))
        .filter(Boolean),
    )
    .superRefine((list, ctx) => {
      if (list.length < min) ctx.addIssue({ code: "custom", message: `Please add at least ${min} ${label}.` });
      if (list.length > maxItems) ctx.addIssue({ code: "custom", message: `Please keep it to ${maxItems} ${label} or fewer.` });
      if (list.some((s) => s.length > maxLen)) ctx.addIssue({ code: "custom", message: `Each item must be under ${maxLen} characters.` });
    });

export const jobPostingSchema = z.object({
  title: line("job title", 5, 120),
  shortTitle: optionalLine("short title", 60),
  team: line("team", 2, 40),
  summary: line("summary", 20, 400),
  overview: items("paragraph", 1, 6, 1500, /\n\s*\n/),
  workOn: items("responsibility", 1, 15, 300, /\n/),
  lookingFor: items("requirement", 1, 15, 300, /\n/),
  niceToHave: items("item", 0, 15, 300, /\n/),
  skills: items("skill", 0, 15, 40, /[,\n]/),
  location: optionalLine("location", 120),
  employmentType: optionalLine("employment type", 60),
  compensation: optionalLine("compensation", 120),
});

export type JobPostingInput = z.input<typeof jobPostingSchema>;
export type JobPosting = z.output<typeof jobPostingSchema>;
export type JobPostingField = keyof JobPosting;
export type JobPostingErrors = Partial<Record<JobPostingField, string>>;

export const jobPostingFieldErrors = (e: z.ZodError) => toFieldErrors<JobPostingField>(e);

/** URL slug from a title: "Senior Engineer — AI/ML" → "senior-engineer-ai-ml". */
export function slugify(title: string): string {
  return (
    title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "") || "role"
  );
}

export function uniqueSlug(title: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = slugify(title);
  if (!used.has(base)) return base;
  for (let i = 2; ; i++) if (!used.has(`${base}-${i}`)) return `${base}-${i}`;
}
