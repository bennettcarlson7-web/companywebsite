import type { ArticleMeta } from "@/types/content";

/**
 * Article metadata (kept separate from the MDX bodies so it can be validated in tests).
 *
 * Date policy: `publishedAt` is the U.S. Pacific calendar date on which the article actually went live.
 * Never set a future date — the site is statically built and has no scheduled publishing, so a future date
 * would simply show up early. `tests/unit/content-integrity.test.ts` enforces this.
 * Bylines are intentionally omitted; add an `author` field only for a real, consenting person.
 */
export const articleMeta: (ArticleMeta & { slug: string })[] = [
  {
    slug: "how-to-scope-an-mvp",
    title: "How to Scope an MVP Without Building Too Much (or Too Little)",
    description:
      "A practical, step-by-step approach to defining a first product release: clarify the problem, map the core journey, cut scope deliberately, and plan for learning.",
    publishedAt: "2026-10-28",
    category: "Product Strategy",
    readingMinutes: 7,
    tags: ["MVP", "Product strategy", "Startups"],
  },
  {
    slug: "evaluating-ai-automation",
    title: "Is AI Automation Worth It? A Practical Evaluation Framework",
    description:
      "How to tell which business tasks are good candidates for AI or automation, estimate value honestly, evaluate before launch, and design the right guardrails.",
    publishedAt: "2026-10-28",
    category: "AI & Automation",
    readingMinutes: 8,
    tags: ["AI", "Automation", "Operations"],
  },
  {
    slug: "choosing-a-software-development-partner",
    title: "How to Choose a Software Development Partner",
    description:
      "What to look for when evaluating agencies, studios, and freelancers: how they think, how they work, what a strong proposal includes, and red flags to watch for.",
    publishedAt: "2026-10-28",
    category: "Working With Partners",
    readingMinutes: 7,
    tags: ["Hiring a partner", "Founders", "Project planning"],
  },
];

/** Today's date (YYYY-MM-DD) in U.S. Pacific time — the latest calendar date anywhere in the contiguous U.S. */
export function todayInUsPacific(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
