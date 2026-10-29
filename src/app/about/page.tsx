import { siteConfig } from "@/lib/site-config";
import { buildMetadata, JsonLd, teamJsonLd } from "@/lib/seo";
import { getTeam } from "@/content/team";
import { ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { EmailContact } from "@/components/ui/email-contact";
import { PageHero } from "@/components/sections/page-hero";
import { CTASection } from "@/components/sections/cta-section";
import { TeamCard } from "@/components/team/team-card";
import type { IconName } from "@/types/content";

export const metadata = buildMetadata({
  title: "About Us — The Team Behind Nextmade",
  description: `Meet the ${siteConfig.name} team: CEO Antonio Ortiz, CTO Ricky Lee Sprouse, and senior software engineers Renz Patdu, Parbin Parajuli, and Joseph Zhang.`,
  path: "/about",
});

const values: { title: string; body: string; icon: IconName }[] = [
  { title: "People first", body: "Software exists to help people. We design for the humans who use it and respect the people we work with.", icon: "users" },
  { title: "Build with integrity", body: "Honest estimates, honest trade-offs, and no claims we can't back up — in our proposals and on this website.", icon: "shield" },
  { title: "Deliver real value", body: "We measure success by whether the software solves the problem, not by how many features we shipped.", icon: "rocket" },
  { title: "Grow together", body: "We share what we know, explain our reasoning, and aim for partnerships that last beyond a single release.", icon: "trending" },
];

const engagementSteps = [
  { title: "Intro conversation", body: "A short, no-pressure conversation to understand your idea or problem and whether we're a good fit." },
  { title: "Discovery or proposal", body: "For clear projects, a written proposal. For fuzzier ones, a focused discovery phase first." },
  { title: "Agreement", body: "A written contract covering scope, milestones, payment terms, ownership, and confidentiality." },
  { title: "Build together", body: "Regular demos, written updates, and shared access to the work as it progresses." },
];

export default function AboutPage() {
  const team = getTeam();
  const leadership = team.filter((m) => m.group === "leadership");
  const engineers = team.filter((m) => m.group === "engineering");
  const { leadershipNote } = siteConfig;

  return (
    <>
      <PageHero
        crumbs={[{ label: "About", href: "/about" }]}
        eyebrow="About us"
        title="A technology partner for what's next"
        intro={`${siteConfig.name} is an early-stage software development and IT consulting company. We help founders and businesses turn ideas into real, working software — and you work directly with the people who build it.`}
        actions={
          <>
            <ButtonLink href={siteConfig.cta.primary.href} size="lg" arrow>
              Discuss Your Project
            </ButtonLink>
            <ButtonLink href={siteConfig.cta.careers.href} size="lg" variant="secondary">
              Explore Careers
            </ButtonLink>
          </>
        }
      />

      <Section labelledBy="mission-heading">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader id="mission-heading" eyebrow="Our mission" title="Turn good ideas into real, working software" />
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
            {leadershipNote && (
              <figure className="rounded-2xl bg-mist p-6 ring-1 ring-cobalt-100">
                <blockquote className="text-navy-900">{leadershipNote.body}</blockquote>
                <figcaption className="mt-3 text-sm text-slate-600">— {leadershipNote.signature}</figcaption>
              </figure>
            )}
          </div>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="team-heading">
        <Container>
          <SectionHeader
            id="team-heading"
            eyebrow="Leadership & engineering"
            title="The people you'll work with"
            description="We're a small, senior-led team, so you talk directly with the people making decisions about your product and the engineers building it."
          />

          <h3 className="mt-12 text-sm font-semibold tracking-wide text-slate-600 uppercase">Leadership</h3>
          <Reveal>
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:max-w-3xl">
              {leadership.map((m) => (
                <li key={m.name}>
                  <TeamCard member={m} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </Reveal>

          <h3 className="mt-10 text-sm font-semibold tracking-wide text-slate-600 uppercase">Engineering</h3>
          <Reveal>
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {engineers.map((m) => (
                <li key={m.name}>
                  <TeamCard member={m} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section labelledBy="values-heading">
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
                <span className="text-sm font-semibold text-cobalt-700">Step {i + 1}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-line sm:flex sm:items-center sm:justify-between sm:gap-6">
            <p className="font-semibold text-navy-900">Prefer email? Write to us directly.</p>
            <EmailContact email={siteConfig.contact.email} location="about" className="mt-2 sm:mt-0" />
          </div>
        </Container>
      </Section>

      <CTASection />
      <JsonLd data={teamJsonLd(team)} />
    </>
  );
}
