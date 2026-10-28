import type { Article, ArticleMeta } from "@/types/content";
import HowToScopeAnMvp from "./how-to-scope-an-mvp.mdx";
import EvaluatingAiAutomation from "./evaluating-ai-automation.mdx";
import ChoosingAPartner from "./choosing-a-software-development-partner.mdx";

/**
 * Article registry. To publish a new article:
 *   1. Add `my-article.mdx` to this folder (Markdown + optional JSX).
 *   2. Import it above and add an entry below with its metadata.
 * Bylines are intentionally omitted; add an `author` field only for real, consenting authors.
 */
const entries: (ArticleMeta & Pick<Article, "slug" | "Content">)[] = [
  {
    slug: "how-to-scope-an-mvp",
    Content: HowToScopeAnMvp,
    title: "How to Scope an MVP Without Building Too Much (or Too Little)",
    description:
      "A practical, step-by-step approach to defining a first product release: clarify the problem, map the core journey, cut scope deliberately, and plan for learning.",
    publishedAt: "2026-10-29",
    category: "Product Strategy",
    readingMinutes: 7,
    tags: ["MVP", "Product strategy", "Startups"],
  },
  {
    slug: "evaluating-ai-automation",
    Content: EvaluatingAiAutomation,
    title: "Is AI Automation Worth It? A Practical Evaluation Framework",
    description:
      "How to tell which business tasks are good candidates for AI or automation, estimate value honestly, evaluate before launch, and design the right guardrails.",
    publishedAt: "2026-10-29",
    category: "AI & Automation",
    readingMinutes: 8,
    tags: ["AI", "Automation", "Operations"],
  },
  {
    slug: "choosing-a-software-development-partner",
    Content: ChoosingAPartner,
    title: "How to Choose a Software Development Partner",
    description:
      "What to look for when evaluating agencies, studios, and freelancers: how they think, how they work, what a strong proposal includes, and red flags to watch for.",
    publishedAt: "2026-10-29",
    category: "Working With Partners",
    readingMinutes: 7,
    tags: ["Hiring a partner", "Founders", "Project planning"],
  },
];

export function getArticles(): Article[] {
  return [...entries].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticle(slug: string): Article | undefined {
  return entries.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, limit = 2): Article[] {
  const current = getArticle(slug);
  const others = getArticles().filter((a) => a.slug !== slug);
  if (!current) return others.slice(0, limit);
  const score = (a: Article) => a.tags.filter((t) => current.tags.includes(t)).length + (a.category === current.category ? 2 : 0);
  return others.sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}
