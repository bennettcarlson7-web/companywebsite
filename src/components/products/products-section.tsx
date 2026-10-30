import { getProducts, isReleased, productProcess, productsHeading, productsIntro } from "@/content/products";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Badge, CheckList, Container, Notice, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { ProductPreview } from "./previews";
import { StatusBadge } from "./product-ui";

/**
 * The Work page's product section: "What We're Building" until a product is usable, then "Built by NextMade".
 * Each product links to its page at /work/<slug>.
 */
export function ProductsSection() {
  const products = getProducts();
  const anyReleased = products.some(isReleased);

  return (
    <>
      <Section labelledBy="products-heading">
        <Container>
          <div id="products" className="scroll-mt-24">
            <SectionHeader
              id="products-heading"
              eyebrow={`${siteConfig.name} Products`}
              title={productsHeading(siteConfig.name)}
              description={
                <>
                  <span className="block font-medium text-navy-900">{productsIntro}</span>
                  <span className="mt-2 block">
                    We&apos;re building three AI products of our own, so you can see exactly how we design, engineer, and
                    ship software — not just read about it.
                  </span>
                </>
              }
            />
          </div>
          {!anyReleased && (
            <div className="mt-8 max-w-3xl">
              <Notice title="Honest status">
                These products are in development. The screens below are <strong>design previews</strong>, not
                screenshots. We&apos;ll add live demos, real screenshots, and case studies as each product starts working.
              </Notice>
            </div>
          )}

          <ol className="mt-10 mb-16 grid gap-3 sm:grid-cols-3" aria-label="Build order">
            {products.map((p, i) => (
              <li key={p.slug} className="flex items-center gap-3 rounded-xl bg-paper p-4 ring-1 ring-line">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <a href={`#${p.slug}`} className="block truncate font-semibold text-navy-900 hover:text-cobalt-700">
                    {p.name}
                  </a>
                  <StatusBadge status={p.status} className="mt-1" />
                </span>
              </li>
            ))}
          </ol>

          <div className="space-y-24">
            {products.map((p, i) => (
              <article key={p.slug} id={p.slug} aria-labelledby={`${p.slug}-name`} className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-12 lg:gap-14">
                <div className={cn("lg:col-span-5", i % 2 === 1 && "lg:order-2")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} />
                    <Badge>{p.category}</Badge>
                  </div>
                  <h3 id={`${p.slug}-name`} className="mt-4 text-3xl font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed text-slate-600">{p.summary}</p>
                  <div className="mt-6 rounded-xl bg-paper p-4 ring-1 ring-line">
                    <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">The problem</p>
                    <p className="mt-1 font-medium text-navy-900">{p.problem.title}</p>
                  </div>
                  <CheckList items={p.features.slice(0, 4).map((f) => f.title)} className="mt-6" />
                  <ul className="mt-6 flex flex-wrap gap-1.5" aria-label={`${p.name} planned technology`}>
                    {p.stack.map((t) => (
                      <li key={t}>
                        <Badge>{t}</Badge>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ButtonLink href={`/work/${p.slug}`} arrow>
                      Explore {p.name}
                    </ButtonLink>
                    {p.demoUrl ? (
                      <ButtonAnchor href={p.demoUrl} variant="secondary" target="_blank" rel="noopener noreferrer">
                        View Demo<span className="sr-only"> of {p.name} (opens in a new tab)</span>
                      </ButtonAnchor>
                    ) : (
                      <span className="text-sm text-slate-600">Demo coming soon</span>
                    )}
                  </div>
                </div>
                <Reveal className={cn("lg:col-span-7", i % 2 === 1 && "lg:order-1")}>
                  <div className="rounded-3xl bg-gradient-to-br from-mist to-cobalt-50 p-4 ring-1 ring-cobalt-100 sm:p-6">
                    <ProductPreview product={p} />
                  </div>
                </Reveal>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="product-process-heading">
        <Container>
          <SectionHeader
            id="product-process-heading"
            eyebrow="How we build"
            title="The same process we use for clients"
            description="Building our own products keeps our engineering honest. Every decision we make here is one we'd stand behind on your project."
          />
          <Reveal>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {productProcess.map((s, i) => (
                <li key={s.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                  <span aria-hidden="true" className="text-sm font-semibold text-cobalt-700">
                    0{i + 1}
                  </span>
                  <h3 className="mt-2 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
