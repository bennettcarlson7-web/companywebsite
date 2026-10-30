import { CheckCircle2, Circle, CircleDashed, CircleDot, type LucideIcon } from "lucide-react";
import { getProducts, isReleased, milestoneLabels, type MilestoneStatus, type Product } from "@/content/products";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { Badge, CheckList, Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { CTASection } from "@/components/sections/cta-section";
import { ProductPreview } from "./previews";
import { DemoActions, ProductCard, StatusBadge } from "./product-ui";

const milestoneIcons: Record<MilestoneStatus, [LucideIcon, string]> = {
  done: [CheckCircle2, "text-success-700"],
  "in-progress": [CircleDot, "text-cobalt-600"],
  next: [Circle, "text-violet-700"],
  planned: [CircleDashed, "text-slate-500"],
};

/** A product's page under /work/<slug>: problem, solution, workflow, features, progress, and demo. */
export function ProductDetail({ product }: { product: Product }) {
  const others = getProducts().filter((p) => p.slug !== product.slug);
  const released = isReleased(product);

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Work", href: "/work" },
          { label: product.name, href: `/work/${product.slug}` },
        ]}
        eyebrow={product.category}
        title={product.name}
        intro={
          <>
            <div className="mb-4">
              <StatusBadge status={product.status} />
            </div>
            <p>{product.summary}</p>
          </>
        }
        actions={<DemoActions product={product} />}
      />

      <section aria-label={`${product.name} preview`} className="bg-white pt-12 sm:pt-16">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-mist to-cobalt-50 p-4 ring-1 ring-cobalt-100 sm:p-8">
              <ProductPreview product={product} />
            </div>
          </Reveal>
        </Container>
      </section>

      <Section labelledBy="problem-heading">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">The problem</p>
            <h2 id="problem-heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {product.problem.title}
            </h2>
            <ul className="mt-6 space-y-3">
              {product.problem.points.map((pt) => (
                <li key={pt} className="flex gap-3 text-slate-700">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-danger-600" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-mist p-6 ring-1 ring-cobalt-100 sm:p-8">
            <p className="eyebrow">The solution</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{product.solution.title}</h2>
            <p className="mt-4 leading-relaxed text-slate-700">{product.solution.body}</p>
          </div>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="workflow-heading">
        <Container>
          <SectionHeader id="workflow-heading" eyebrow="How it works" title={`${product.name}, step by step`} />
          <Reveal>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.workflow.map((step, i) => (
                <li key={step.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-line">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-cobalt-600 text-sm font-semibold text-white"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      <Section labelledBy="features-heading">
        <Container>
          <SectionHeader id="features-heading" eyebrow="Core features" title="What it does" />
          <Reveal>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {product.features.map((f) => (
                <li key={f.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="progress-heading">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader
              id="progress-heading"
              eyebrow="Development"
              title={released ? "How we built it" : "Where it stands"}
              description="We build the core workflow first, prove it works, then extend it. Milestones are updated as the work moves."
            />
            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">
                {released ? "Technology" : "Planned technology"}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {product.stack.map((t) => (
                  <li key={t}>
                    <Badge>{t}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ol className="space-y-3 lg:col-span-7">
            {product.milestones.map((m) => {
              const [Icon, tone] = milestoneIcons[m.status];
              return (
                <li key={m.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-line">
                  <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", tone)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{m.title}</h3>
                      <span className={cn("text-xs font-semibold", tone)}>{milestoneLabels[m.status]}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{m.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Container>
      </Section>

      <Section labelledBy="demo-heading">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl bg-navy-900 p-8 sm:p-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow text-cobalt-300">{released ? "Try it" : "Demo"}</p>
              <h2 id="demo-heading" className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {released ? `See ${product.name} in action` : `Be first to try ${product.name}`}
              </h2>
              <p className="mt-3 leading-relaxed text-slate-300">
                {product.demoUrl
                  ? "Open the live demo with sample data — no sign-up needed."
                  : "We'll publish a working demo, real screenshots, and what we learned once the core workflow is complete. Ask for early access and we'll let you know."}
              </p>
              {!released && <CheckList items={["Early look at the working product", "No commitment"]} className="mt-5 [&_span]:text-slate-200" />}
            </div>
            <div className="lg:col-span-5 lg:justify-self-end [&_p]:text-slate-300">
              <DemoActions product={product} />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="more-products-heading">
        <Container>
          <SectionHeader id="more-products-heading" eyebrow={`More from ${siteConfig.name}`} title="Other products we're building" />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {others.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CTASection
        title="Have a workflow like this to fix?"
        body="We build custom software around the way your business actually works. Tell us what slows your team down."
      />
    </>
  );
}
