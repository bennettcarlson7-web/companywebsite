import Link from "next/link";
import { Clock } from "lucide-react";
import { formatArticleDate, getArticles } from "@/content/insights";
import { buildMetadata } from "@/lib/seo";
import { Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/sections/page-hero";
import { ArticleCard } from "@/components/sections/cards";
import { CTASection } from "@/components/sections/cta-section";
import { ArticleVisual } from "@/components/visuals/article-visual";

export const metadata = buildMetadata({
  title: "Insights — Practical Guides for Founders & Teams",
  description:
    "Practical, plain-language guides on scoping MVPs, evaluating AI automation, choosing a software partner, and planning your next software project.",
  path: "/insights",
});

export default function InsightsPage() {
  const [featured, ...rest] = getArticles();
  return (
    <>
      <PageHero
        crumbs={[{ label: "Insights", href: "/insights" }]}
        eyebrow="Insights"
        title="Ideas, insights, and practical knowledge"
        intro="Clear, useful guides for founders and teams planning software — written to help you make better decisions, whether or not you work with us."
      />

      <Section labelledBy="articles-heading">
        <Container>
          <h2 id="articles-heading" className="sr-only">
            Articles
          </h2>
          {featured && (
            <article className="group relative grid overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-line shadow-soft transition-shadow hover:shadow-card lg:grid-cols-2">
              <ArticleVisual category={featured.category} className="lg:aspect-auto lg:h-full" />
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <p className="text-xs font-semibold tracking-wide text-cobalt-700 uppercase">
                  Featured · {featured.category}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  <Link
                    href={`/insights/${featured.slug}`}
                    className="after:absolute after:inset-0 after:rounded-[1.75rem] focus-visible:outline-none"
                  >
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-4 leading-relaxed text-slate-600">{featured.description}</p>
                <p className="mt-6 flex items-center gap-3 text-sm text-slate-600">
                  <time dateTime={featured.publishedAt}>{formatArticleDate(featured.publishedAt)}</time>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden="true" className="size-4" />
                    {featured.readingMinutes} min read
                  </span>
                </p>
              </div>
            </article>
          )}

          {rest.length > 0 && (
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {rest.map((article) => (
                <li key={article.slug}>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <CTASection
        title="Have a question we haven't covered?"
        body="Tell us what you're trying to figure out. If it's useful to others, it might become our next guide — and we'll answer you directly either way."
      />
    </>
  );
}
