import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { engagementModels, getServices } from "@/content/services";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon";
import { CheckList, Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessOverview } from "@/components/sections/shared";
import { CTASection } from "@/components/sections/cta-section";

export const metadata = buildMetadata({
  title: "Software Development & IT Consulting Services",
  description:
    "Custom software, web and mobile apps, AI and workflow automation, system integration and modernization, and dedicated engineering teams — scoped to your goals.",
  path: "/services",
});

const outcomes = [
  "A clear plan before significant budget is spent",
  "Working software you can see and test early",
  "Fewer manual steps and more reliable data",
  "Products that are accessible, secure, and maintainable",
  "Code and documentation your team can own",
  "A partner who tells you when something should be simpler",
];

export default function ServicesPage() {
  const services = getServices();
  return (
    <>
      <PageHero
        crumbs={[{ label: "Services", href: "/services" }]}
        eyebrow="Services"
        title="Technology services to turn ideas into reality"
        intro="We help founders and businesses plan, design, build, and improve software. Engage us for a focused project, an ongoing product partnership, or extra engineering capacity."
        actions={
          <ButtonLink href={siteConfig.cta.primary.href} size="lg" arrow>
            {siteConfig.cta.primary.label}
          </ButtonLink>
        }
      />

      <Section labelledBy="service-list-heading">
        <Container>
          <h2 id="service-list-heading" className="sr-only">
            Our services
          </h2>
          <ul className="grid gap-5">
            {services.map((service) => (
              <li key={service.slug}>
                <Reveal>
                  <article className="group relative grid gap-6 rounded-2xl bg-white p-6 ring-1 ring-line shadow-soft transition-shadow hover:shadow-card sm:p-8 lg:grid-cols-12 lg:items-center">
                    <div className="flex gap-5 lg:col-span-5">
                      <IconTile name={service.icon} />
                      <div>
                        <h3 className="text-xl font-semibold">
                          <Link
                            href={`/services/${service.slug}`}
                            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
                          >
                            {service.title}
                          </Link>
                        </h3>
                        <p className="mt-2 leading-relaxed text-slate-600">{service.summary}</p>
                      </div>
                    </div>
                    <div className="lg:col-span-5">
                      <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Ideal for</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                        {service.idealFor.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-cobalt-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="lg:col-span-2 lg:text-right">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-700">
                        Explore
                        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="outcomes-heading">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeader
            id="outcomes-heading"
            eyebrow="Outcomes"
            title="What you can expect from working with us"
            description="We can't promise specific business results — nobody honestly can. What we can promise is how we work, and these are the outcomes our process is designed to produce."
          />
          <div className="rounded-2xl bg-white p-6 ring-1 ring-line sm:p-8">
            <CheckList items={outcomes} />
          </div>
        </Container>
      </Section>

      <Section labelledBy="models-heading">
        <Container>
          <SectionHeader
            id="models-heading"
            eyebrow="Engagement models"
            title="Flexible ways to work together"
            description="Pricing is always scoped to your project. After discovery we recommend the model that fits your goals, budget, and level of certainty."
          />
          <Reveal>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {engagementModels.map((model) => (
                <li key={model.title} className="flex flex-col rounded-2xl bg-white p-6 ring-1 ring-line">
                  <h3 className="text-lg font-semibold">{model.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{model.body}</p>
                  <p className="mt-5 border-t border-line pt-4 text-sm">
                    <span className="font-semibold text-navy-900">Best for: </span>
                    <span className="text-slate-600">{model.bestFor}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <ProcessOverview tone="mist" />
      <CTASection />
    </>
  );
}
