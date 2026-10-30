import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Project } from "@/types/content";
import { getProject, getProjects } from "@/content/projects";
import { getProduct, getProducts } from "@/content/products";
import { ProductDetail } from "@/components/products/product-detail";
import { getService } from "@/content/services";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { Badge, CheckList, ConceptBadge, Container, Notice, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/sections/page-hero";
import { ProjectCard, ServiceCard } from "@/components/sections/cards";
import { CTASection } from "@/components/sections/cta-section";
import { ProjectVisual } from "@/components/visuals/project-visual";

// Fully prerendered from generateStaticParams; unknown slugs render the 404 page.
export const ensureStatic = "navigation";

// /work/<slug> serves both our own products and concept projects (slugs are unique across both; see tests).
export function generateStaticParams() {
  return [...getProducts(), ...getProjects()].map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (product) {
    return buildMetadata({ title: `${product.name} — ${product.category}`, description: product.seoDescription, path: `/work/${slug}` });
  }
  const project = getProject(slug);
  if (!project) return {};
  const prefix = project.kind === "concept" ? "Concept: " : "";
  return buildMetadata({ title: `${prefix}${project.title}`, description: project.seoDescription, path: `/work/${slug}` });
}

export default async function WorkItemPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (product) return <ProductDetail product={product} />;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}

function ProjectDetail({ project }: { project: Project }) {
  const isConcept = project.kind === "concept";
  const services = project.relatedServices.map(getService).filter((s) => s !== undefined);
  const more = getProjects()
    .filter((p) => p.slug !== project.slug)
    .slice(0, 2);

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Work", href: "/work" },
          { label: project.title, href: `/work/${project.slug}` },
        ]}
        eyebrow={project.category}
        title={project.title}
        intro={
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {isConcept ? <ConceptBadge /> : <Badge tone="blue">Case study</Badge>}
              {project.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <p>{project.summary}</p>
          </>
        }
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="grid gap-12 lg:grid-cols-12">
          <article className="lg:col-span-8">
            {isConcept && (
              <Notice title="Illustrative example">
                This is a concept project created to demonstrate how we approach this kind of problem. It does not
                describe a real client, and it makes no claims about delivered results. Details are representative,
                not factual.
              </Notice>
            )}

            <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-line">
              <ProjectVisual variant={project.visual} />
            </div>

            <CaseSection title={isConcept ? "The scenario" : "Background"}>
              <p>{project.scenario}</p>
            </CaseSection>

            <CaseSection title="The challenge">
              <CheckList items={project.challenge} />
            </CaseSection>

            <CaseSection title="Our approach">
              <ol className="space-y-4">
                {project.approach.map((a, i) => (
                  <li key={a.title} className="flex gap-4 rounded-2xl bg-paper p-5 ring-1 ring-line">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-cobalt-700 ring-1 ring-cobalt-100">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{a.title}</h3>
                      <p className="mt-1 leading-relaxed text-slate-600">{a.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CaseSection>

            <CaseSection title={isConcept ? "Proposed solution" : "The solution"}>
              <CheckList items={project.solution} />
            </CaseSection>

            <CaseSection title="Things we'd watch closely">
              <ul className="space-y-3">
                {project.considerations.map((c) => (
                  <li key={c} className="rounded-xl border-l-4 border-cobalt-300 bg-white py-2 pl-4 text-slate-700">
                    {c}
                  </li>
                ))}
              </ul>
            </CaseSection>
          </article>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-line lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">Key features</h2>
              <ul className="mt-3 space-y-2 text-sm text-navy-900">
                {project.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cobalt-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <h2 className="mt-6 text-sm font-semibold tracking-wide text-slate-600 uppercase">
                {isConcept ? "Suggested technologies" : "Technologies"}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <li key={t}>
                    <Badge>{t}</Badge>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-line pt-6">
                <p className="text-sm text-slate-600">Facing a similar problem?</p>
                <ButtonLink href={siteConfig.cta.primary.href} className="mt-3 w-full" arrow>
                  Tell Us About It
                </ButtonLink>
              </div>
            </div>
          </aside>
        </Container>
      </Section>

      {services.length > 0 && (
        <Section tone="mist" labelledBy="project-services-heading">
          <Container>
            <h2 id="project-services-heading" className="text-2xl font-semibold tracking-tight">
              Related services
            </h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <ServiceCard service={s} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <Section labelledBy="more-work-heading">
        <Container>
          <h2 id="more-work-heading" className="text-2xl font-semibold tracking-tight">
            More work
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {more.map((p) => (
              <li key={p.slug}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}

function CaseSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 text-[1.0625rem] leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}
