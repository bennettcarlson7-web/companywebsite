import { processSteps } from "@/content/process";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { Icon, IconTile } from "@/components/ui/icon";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { CTASection } from "@/components/sections/cta-section";
import type { IconName } from "@/types/content";

export const metadata = buildMetadata({
  title: "Our Process — From Discovery to Launch & Growth",
  description:
    "How we work: discovery, product strategy and scope, design and prototyping, iterative development, and launch and growth — with clear milestones and communication.",
  path: "/process",
});

const collaboration: { title: string; body: string; icon: IconName }[] = [
  {
    title: "One clear point of contact",
    body: "You'll always know who to talk to. They understand your goals and keep the whole picture in view.",
    icon: "message",
  },
  {
    title: "A predictable rhythm",
    body: "Regular check-ins and demos at a cadence agreed up front, plus written updates you can share internally.",
    icon: "gauge",
  },
  {
    title: "Visible work in progress",
    body: "Access to the project board, staging environment, and code repository — no black boxes.",
    icon: "layout",
  },
  {
    title: "Early, honest flags",
    body: "If something takes longer, costs more, or turns out to be a bad idea, you'll hear it from us early, with options.",
    icon: "shield",
  },
];

const milestones = [
  { title: "Scope sign-off", body: "Agreed first-release scope, estimate range, and milestone plan." },
  { title: "Prototype review", body: "Clickable prototype of the key flows, tested and approved." },
  { title: "Feature-complete beta", body: "All first-release features working in a staging environment." },
  { title: "Launch readiness", body: "Testing, accessibility, security, and launch checklist complete." },
  { title: "Post-launch review", body: "Look back at what we learned and agree on what's next." },
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Process", href: "/process" }]}
        eyebrow="Process"
        title="A clear path from idea to launch — and beyond"
        intro="Building software involves a lot of decisions. Our process is designed to make them visible, make them together, and make them at the right time."
        actions={
          <ButtonLink href={siteConfig.cta.primary.href} size="lg" arrow>
            {siteConfig.cta.primary.label}
          </ButtonLink>
        }
      />

      <Section labelledBy="steps-heading">
        <Container>
          <SectionHeader id="steps-heading" eyebrow="Five steps" title="How a project typically unfolds" />
          <ol className="relative mt-12 space-y-6 before:absolute before:top-6 before:bottom-6 before:left-6 before:w-px before:bg-cobalt-100 md:before:left-8">
            {processSteps.map((step) => (
              <li key={step.number} className="relative">
                <Reveal>
                  <div className="flex gap-5 md:gap-8">
                    <span className="relative z-10 inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-cobalt-600 text-sm font-semibold text-white shadow-cta md:size-16 md:text-base">
                      {step.number}
                    </span>
                    <article className="flex-1 rounded-2xl bg-white p-6 ring-1 ring-line shadow-soft sm:p-8">
                      <div className="flex items-center gap-3">
                        <Icon name={step.icon} className="size-5 text-cobalt-600" />
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">{step.details}</p>
                      <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-semibold tracking-wide text-slate-600 uppercase">What happens</h4>
                          <ul className="mt-2 space-y-1.5 text-sm text-navy-900">
                            {step.activities.map((a) => (
                              <li key={a} className="flex gap-2">
                                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cobalt-500" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold tracking-wide text-slate-600 uppercase">What you get</h4>
                          <ul className="mt-2 space-y-1.5 text-sm text-navy-900">
                            {step.outputs.map((o) => (
                              <li key={o} className="flex gap-2">
                                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success-700" />
                                {o}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="collab-heading">
        <Container>
          <SectionHeader
            id="collab-heading"
            eyebrow="Collaboration"
            title="How we work together day to day"
            description="Good communication is the difference between a project that feels calm and one that feels chaotic."
          />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {collaboration.map((c) => (
              <li key={c.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                <IconTile name={c.icon} />
                <h3 className="mt-5 font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section labelledBy="milestones-heading">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              id="milestones-heading"
              eyebrow="Milestones"
              title="Checkpoints you can see and approve"
              description="Each phase ends with something concrete to review. Exact milestones and payment schedules are agreed in your proposal."
            />
            <ol className="mt-8 space-y-3">
              {milestones.map((m, i) => (
                <li key={m.title} className="flex gap-4 rounded-xl bg-paper p-4 ring-1 ring-line">
                  <span className="text-sm font-semibold text-cobalt-600">M{i + 1}</span>
                  <div>
                    <p className="font-semibold text-navy-900">{m.title}</p>
                    <p className="text-sm text-slate-600">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[2rem] bg-navy-900 p-8 text-slate-300 sm:p-10">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white/10 text-cobalt-300 ring-1 ring-white/20">
              <Icon name="shield" className="size-5" />
            </span>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">Ownership of code & IP</h2>
            <div className="mt-4 space-y-4 leading-relaxed">
              <p>
                Our standard approach is simple: <strong className="text-white">you own what you pay for.</strong> Code,
                designs, and documentation created for your project are intended to belong to you, with ownership
                transferring as set out in our written agreement.
              </p>
              <p>
                We recommend that code lives in repositories under your organization&apos;s account and that cloud services
                are set up in your name from day one, so you&apos;re never locked in.
              </p>
              <p className="text-sm text-slate-400">
                The specific terms — including any open-source components, third-party licenses, and pre-existing tools
                we bring — are defined in each engagement&apos;s contract. This page is a summary, not a legal commitment.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <CTASection title="Ready to start with discovery?" />
    </>
  );
}
