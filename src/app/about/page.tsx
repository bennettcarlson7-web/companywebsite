import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { CTASection } from "@/components/sections/cta-section";
import type { IconName } from "@/types/content";

export const metadata = buildMetadata({
  title: "About Us — A Founder-Led Software Studio",
  description: `${siteConfig.name} is a founder-led software development and IT consulting studio helping founders and businesses turn ideas into well-engineered products.`,
  path: "/about",
});

const values: { title: string; body: string; icon: IconName }[] = [
  { title: "People first", body: "Software exists to help people. We design for the humans who use it and respect the people we work with.", icon: "users" },
  { title: "Build with integrity", body: "Honest estimates, honest trade-offs, and no claims we can't back up — in our proposals and on this website.", icon: "shield" },
  { title: "Deliver real value", body: "We measure success by whether the software solves the problem, not by how many features we shipped.", icon: "rocket" },
  { title: "Grow together", body: "We share what we know, explain our reasoning, and aim for partnerships that last beyond a single release.", icon: "trending" },
];

const engagementSteps = [
  { title: "Intro conversation", body: "A free, no-pressure call to understand your idea or problem and see if we're a good fit." },
  { title: "Discovery or proposal", body: "For clear projects, a written proposal. For fuzzier ones, a short paid discovery phase first." },
  { title: "Agreement", body: "A written contract covering scope, milestones, payment terms, ownership, and confidentiality." },
  { title: "Build together", body: "Regular demos, written updates, and shared access to the work as it progresses." },
];

export default function AboutPage() {
  const { team, founderNote } = siteConfig;
  return (
    <>
      <PageHero
        crumbs={[{ label: "About", href: "/about" }]}
        eyebrow="About us"
        title="A technology partner for what's next"
        intro={`${siteConfig.name} is a founder-led software studio. We help founders, startups, and growing businesses turn ideas into real, well-engineered digital products — and we're building the company we'd want to hire.`}
        actions={
          <ButtonLink href={siteConfig.cta.primary.href} size="lg" arrow>
            {siteConfig.cta.primary.label}
          </ButtonLink>
        }
      />

      <Section labelledBy="mission-heading">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader id="mission-heading" eyebrow="Our mission" title="Make good software accessible to people with good ideas" />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-slate-700 lg:col-span-7">
            <p>
              Great ideas come from people who understand a problem deeply — a clinic manager, a logistics lead, a founder
              who has lived the frustration. Too often, those ideas never become software because building it feels
              expensive, opaque, or risky.
            </p>
            <p>
              We exist to change that. We pair product thinking with careful engineering, explain every decision in plain
              language, and focus each release on what will make the biggest difference.
            </p>
            {founderNote && (
              <figure className="rounded-2xl bg-mist p-6 ring-1 ring-cobalt-100">
                <blockquote className="text-navy-900">{founderNote.body}</blockquote>
                <figcaption className="mt-3 text-sm text-slate-600">— {founderNote.signature}</figcaption>
              </figure>
            )}
          </div>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="values-heading">
        <Container>
          <SectionHeader id="values-heading" eyebrow="Our values" title="What we hold ourselves to" />
          <Reveal>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <li key={v.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                  <IconTile name={v.icon} />
                  <h3 className="mt-5 font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section labelledBy="founder-led-heading">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              id="founder-led-heading"
              eyebrow="Founder-led"
              title="You work directly with the people accountable for the work"
              description="As an early-stage studio, we're deliberately small. That means senior attention on your project, short lines of communication, and no hand-offs to a team you've never met."
            />
            <p className="mt-5 leading-relaxed text-slate-600">
              It also means we&apos;re selective about the projects we take on, so we can give each one the focus it
              deserves. If we&apos;re not the right fit, we&apos;ll tell you — and point you in a better direction when
              we can.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-line shadow-soft sm:p-8">
            <h2 className="text-lg font-semibold">The team</h2>
            {team.length > 0 ? (
              <ul className="mt-5 grid gap-5 sm:grid-cols-2">
                {team.map((m) => (
                  <li key={m.name}>
                    <p className="font-semibold text-navy-900">{m.name}</p>
                    <p className="text-sm text-cobalt-700">{m.role}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{m.bio}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 leading-relaxed text-slate-600">
                Team profiles are coming soon. In the meantime, just ask — we&apos;re happy to tell you exactly who
                you&apos;d be working with, their background, and their role on your project before you commit to anything.
              </p>
            )}
          </div>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="engagements-heading">
        <Container>
          <SectionHeader
            id="engagements-heading"
            eyebrow="Working together"
            title="How engagements work"
            description="A straightforward path from first conversation to working software."
          />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {engagementSteps.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                <span className="text-sm font-semibold text-cobalt-600">Step {i + 1}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
