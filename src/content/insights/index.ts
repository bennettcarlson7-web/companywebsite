import type { ComponentType } from "react";
import type { Article } from "@/types/content";
import { articleMeta } from "./meta";
import HowToScopeAnMvp from "./how-to-scope-an-mvp.mdx";
import EvaluatingAiAutomation from "./evaluating-ai-automation.mdx";
import ChoosingAPartner from "./choosing-a-software-development-partner.mdx";

/**
 * Article registry. To publish a new article:
 *   1. Add `my-article.mdx` to this folder (Markdown + optional JSX; headings start at ##).
 *   2. Add its metadata to `meta.ts` (see the date policy there).
 *   3. Import it below and add it to `bodies`.
 */
const bodies: Record<string, ComponentType> = {
  "how-to-scope-an-mvp": HowToScopeAnMvp,
  "evaluating-ai-automation": EvaluatingAiAutomation,
  "choosing-a-software-development-partner": ChoosingAPartner,
};

const entries: Article[] = articleMeta.map((meta) => {
  const Content = bodies[meta.slug];
  if (!Content) throw new Error(`Missing MDX body for article "${meta.slug}"`);
  return { ...meta, Content };
});

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

export { formatArticleDate } from "./format";
