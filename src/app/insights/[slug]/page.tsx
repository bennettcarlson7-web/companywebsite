import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { formatArticleDate, getArticle, getArticles, getRelatedArticles } from "@/content/insights";
import { siteConfig } from "@/lib/site-config";
import { JsonLd, articleJsonLd, buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge, Container, Section } from "@/components/ui/primitives";
import { ArticleCard } from "@/components/sections/cards";
import { CTASection } from "@/components/sections/cta-section";

// Fully prerendered from generateStaticParams; unknown slugs render the 404 page.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `/insights/${slug}`,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
  });
}

export default async function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const { Content } = article;
  const related = getRelatedArticles(slug, 2);

  return (
    <>
      <article>
        <header className="border-b border-line bg-gradient-to-b from-mist to-white">
          <Container className="py-12 sm:py-16">
            <div className="mx-auto max-w-3xl">
              <Breadcrumbs
                items={[
                  { label: "Insights", href: "/insights" },
                  { label: article.title, href: `/insights/${article.slug}` },
                ]}
              />
              <p className="mt-8 text-sm font-semibold tracking-wide text-cobalt-700 uppercase">{article.category}</p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">{article.title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">{article.description}</p>
              <dl className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                <div className="flex gap-1.5">
                  <dt>Published</dt>
                  <dd>
                    <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
                  </dd>
                </div>
                {article.updatedAt && (
                  <div className="flex gap-1.5">
                    <dt>Updated</dt>
                    <dd>
                      <time dateTime={article.updatedAt}>{formatArticleDate(article.updatedAt)}</time>
                    </dd>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <dt>
                    <Clock aria-hidden="true" className="size-4" />
                    <span className="sr-only">Reading time</span>
                  </dt>
                  <dd>{article.readingMinutes} min read</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="sr-only">Published by</dt>
                  <dd>The {siteConfig.name} team</dd>
                </div>
              </dl>
            </div>
          </Container>
        </header>

        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <Content />

            <footer className="mt-14 border-t border-line pt-8">
              <ul className="flex flex-wrap gap-2" aria-label="Topics">
                {article.tags.map((t) => (
                  <li key={t}>
                    <Badge tone="blue">{t}</Badge>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-2xl bg-mist p-6 ring-1 ring-cobalt-100 sm:p-8">
                <h2 className="text-xl font-semibold">Want to talk through your situation?</h2>
                <p className="mt-2 leading-relaxed text-slate-600">
                  Guides can only go so far. If you&apos;d like a second opinion on your project, tell us a bit about it.
                </p>
                <ButtonLink href={siteConfig.cta.primary.href} className="mt-5" arrow>
                  {siteConfig.cta.primary.label}
                </ButtonLink>
              </div>
            </footer>
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <Section tone="mist" labelledBy="related-heading">
          <Container>
            <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">
              Related articles
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {related.map((a) => (
                <li key={a.slug}>
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CTASection />
      <JsonLd data={articleJsonLd(article)} />
    </>
  );
}
