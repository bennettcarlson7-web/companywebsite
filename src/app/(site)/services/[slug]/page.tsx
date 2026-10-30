import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getService, getServices } from "@/content/services";
import { getProjects } from "@/content/projects";
import { siteConfig } from "@/lib/site-config";
import { JsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { Icon, IconTile } from "@/components/ui/icon";
import { Badge, CheckList, Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { FAQAccordion } from "@/components/sections/faq";
import { ProjectCard, ServiceCard } from "@/components/sections/cards";
import { CTASection } from "@/components/sections/cta-section";

// Fully prerendered from generateStaticParams; unknown slugs render the 404 page.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return buildMetadata({ title: service.seoTitle, description: service.seoDescription, path: `/services/${slug}` });
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = getProjects().filter((p) => p.relatedServices.includes(service.slug));
  const others = getServices().filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Services", href: "/services" },
          { label: service.shortTitle, href: `/services/${service.slug}` },
        ]}
        eyebrow="Service"
        title={service.title}
        intro={<p>{service.intro}</p>}
        actions={
          <>
            <ButtonLink href={siteConfig.cta.primary.href} size="lg" arrow>
              Discuss Your Project
            </ButtonLink>
            <ButtonLink href="/work" size="lg" variant="secondary">
              See Example Work
            </ButtonLink>
          </>
        }
        aside={
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-line sm:p-8">
            <div className="flex items-center gap-3">
              <IconTile name={service.icon} />
              <h2 className="text-base font-semibold">A good fit for…</h2>
            </div>
            <CheckList items={service.idealFor} className="mt-5" />
          </div>
        }
      />

      <Section labelledBy="problems-heading">
        <Container>
          <SectionHeader id="problems-heading" eyebrow="Common challenges" title="Problems we help solve" />
          <Reveal>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {service.problems.map((p) => (
                <li key={p.title} className="rounded-2xl bg-paper p-6 ring-1 ring-line">
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="benefits-heading">
        <Container>
          <SectionHeader id="benefits-heading" eyebrow="How we help" title="What you get with our approach" />
          <Reveal>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {service.benefits.map((b, i) => (
                <li key={b.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                  <span className="text-sm font-semibold text-cobalt-600">0{i + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section labelledBy="deliverables-heading">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              id="deliverables-heading"
              eyebrow="Example deliverables"
              title="What a typical engagement can include"
              description="Every project is scoped individually; these are common examples, not a fixed package."
            />
            <CheckList items={service.deliverables} className="mt-8" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <ol className="mt-6 space-y-4">
              {service.process.map((step, i) => (
                <li key={step.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-line">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-cobalt-50 text-sm font-semibold text-cobalt-700 ring-1 ring-cobalt-100">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                <Icon name="layers" className="size-4 text-cobalt-600" />
                Technologies we often use
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {service.technologies.map((t) => (
                  <li key={t}>
                    <Badge>{t}</Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-600">We recommend technology based on your needs; no vendor partnership is implied.</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="service-faq-heading">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="service-faq-heading" eyebrow="FAQ" title={`${service.shortTitle} questions`} />
          </div>
          <div className="lg:col-span-8">
            <FAQAccordion faqs={service.faqs} withSchema />
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section labelledBy="related-work-heading">
          <Container>
            <SectionHeader
              id="related-work-heading"
              eyebrow="Illustrative examples"
              title="See this approach in a concept project"
            />
            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <Section tone={related.length > 0 ? "mist" : "white"} labelledBy="other-services-heading">
        <Container>
          <SectionHeader id="other-services-heading" eyebrow="More services" title="Other ways we can help" />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CTASection title={`Interested in ${service.shortTitle}? Let's talk.`} />
      <JsonLd data={serviceJsonLd(service)} />
    </>
  );
}
