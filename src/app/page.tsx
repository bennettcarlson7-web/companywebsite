import { generalFaqs } from "@/content/faqs";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import {
  Audiences,
  DifferentiatorStrip,
  FeaturedWork,
  FounderStory,
  HomeHero,
  InsightsPreview,
  WhatWeDo,
  WhyUs,
} from "@/components/sections/home";
import { ProcessOverview, TechCapabilities } from "@/components/sections/shared";
import { FAQAccordion } from "@/components/sections/faq";
import { CTASection } from "@/components/sections/cta-section";
import { TextLink } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: `${siteConfig.name} — Your Idea. Our Engineering. Real Results.`,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <DifferentiatorStrip />
      <WhatWeDo />
      <Audiences />
      <FeaturedWork />
      <WhyUs />
      <ProcessOverview />
      <TechCapabilities tone="mist" />
      <FounderStory />
      <Section tone="mist" labelledBy="faq-heading">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader
              id="faq-heading"
              eyebrow="FAQ"
              title="Questions we hear often"
              description="Straight answers about budgets, timelines, ownership, and how we work."
            />
            <div className="mt-6">
              <TextLink href="/contact">Ask us something else</TextLink>
            </div>
          </div>
          <div className="lg:col-span-8">
            <FAQAccordion faqs={generalFaqs} withSchema />
          </div>
        </Container>
      </Section>
      <InsightsPreview />
      <CTASection />
    </>
  );
}
