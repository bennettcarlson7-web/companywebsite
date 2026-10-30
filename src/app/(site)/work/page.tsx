import { getProjects } from "@/content/projects";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Notice, Section, SectionHeader } from "@/components/ui/primitives";
import { ProductsSection } from "@/components/products/products-section";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { ProjectCard } from "@/components/sections/cards";
import { CTASection } from "@/components/sections/cta-section";

export const metadata = buildMetadata({
  title: "Work — Our Products & Concept Projects",
  description:
    "The AI products NextMade is building — ClientFlow AI, CommercePilot AI, and FieldOps AI — plus illustrative concept projects showing how we approach real business problems.",
  path: "/work",
});

export default function WorkPage() {
  const projects = getProjects();
  const hasConcepts = projects.some((p) => p.kind === "concept");
  return (
    <>
      <PageHero
        crumbs={[{ label: "Work", href: "/work" }]}
        eyebrow="Work"
        title="Real problems, practical solutions"
        intro="The products we're building ourselves, and concept projects that show how we think through product and engineering problems — from understanding the challenge to shaping a solution that can actually ship."
        actions={
          <>
            <ButtonLink href="#products" size="lg" arrow>
              Our Products
            </ButtonLink>
            <ButtonLink href="#concepts" size="lg" variant="secondary">
              Concept Projects
            </ButtonLink>
          </>
        }
      />

      <ProductsSection />

      <Section labelledBy="projects-heading">
        <Container>
          <div id="concepts" className="scroll-mt-24">
            <SectionHeader
              id="projects-heading"
              eyebrow="Concept projects"
              title="How we'd approach common problems"
              description="Illustrative examples of client work we're equipped to do."
            />
          </div>
          {hasConcepts && (
            <div className="mt-8 mb-10 max-w-3xl">
              <Notice title="About these projects">
                {siteConfig.name} is a new studio. The projects below are <strong>concept projects</strong> — illustrative
                examples we created to show our approach. They are not client engagements and make no claims about
                results. We&apos;ll publish real case studies here once client work is complete and approved for
                sharing.
              </Notice>
            </div>
          )}
          <Reveal>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="mt-14 rounded-2xl bg-mist p-8 text-center ring-1 ring-cobalt-100">
            <h2 className="text-xl font-semibold">Want to see how we&apos;d approach your project?</h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">
              Share a short description and we&apos;ll walk you through how we would scope it, what we&apos;d build first,
              and the trade-offs worth considering.
            </p>
            <div className="mt-6">
              <ButtonLink href={siteConfig.cta.primary.href} arrow>
                {siteConfig.cta.primary.label}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
