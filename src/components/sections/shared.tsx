import { processSteps } from "@/content/process";
import { technologyGroups } from "@/content/home";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProcessStepCard } from "./cards";

export function ProcessOverview({ tone = "white" }: { tone?: "white" | "mist" }) {
  return (
    <Section tone={tone} labelledBy="process-heading">
      <Container>
        <SectionHeader
          id="process-heading"
          eyebrow="Our process"
          title="A transparent, collaborative approach"
          description="Clear steps, regular check-ins, and working software early — so you always know where your project stands."
          action={<TextLink href="/process">How we work</TextLink>}
        />
        <Reveal>
          <ol className="relative mt-12 grid gap-8 lg:grid-cols-5 lg:gap-6">
            <span aria-hidden="true" className="absolute top-6 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-cobalt-200 via-cobalt-300 to-cobalt-200 lg:block" />
            {processSteps.map((step) => (
              <ProcessStepCard key={step.number} step={step} compact />
            ))}
          </ol>
        </Reveal>
      </Container>
    </Section>
  );
}

export function TechCapabilities({ tone = "white" }: { tone?: "white" | "mist" }) {
  return (
    <Section tone={tone} labelledBy="tech-heading">
      <Container>
        <SectionHeader
          id="tech-heading"
          eyebrow="Technology"
          title="Modern tools, chosen for your needs"
          description="We pick technology based on your product, team, and budget — not trends. These are tools we commonly work with."
        />
        <Reveal>
          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {technologyGroups.map((group) => (
              <div key={group.label} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                <dt className="text-sm font-semibold text-navy-900">{group.label}</dt>
                <dd className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-lg bg-paper px-2.5 py-1 text-sm text-slate-700 ring-1 ring-line">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <p className="mt-5 text-xs text-slate-600">
          Product names are trademarks of their respective owners. Listing them describes our technical experience and
          does not imply partnership, endorsement, or a client relationship.
        </p>
      </Container>
    </Section>
  );
}
