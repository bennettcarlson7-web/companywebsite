import { ArrowUpRight, Mail } from "lucide-react";
import { getCareersEmail, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { PageHero } from "@/components/sections/page-hero";
import type { IconName } from "@/types/content";

export const metadata = buildMetadata({
  title: "Careers — Build the Future With Us",
  description: `Careers at ${siteConfig.name}: an early-stage, founder-led software studio. See open roles or tell us about yourself for future opportunities.`,
  path: "/careers",
});

const principles: { title: string; body: string; icon: IconName }[] = [
  { title: "Craft over volume", body: "We'd rather ship fewer, better things — with tests, documentation, and care.", icon: "shield" },
  { title: "Direct client impact", body: "Work closely with founders and teams, and see how your work changes their day.", icon: "rocket" },
  { title: "Clear, kind communication", body: "Write things down, share context generously, and give honest feedback.", icon: "message" },
  { title: "Room to grow", body: "As an early team, everyone shapes how we work — and grows with the company.", icon: "trending" },
];

export default function CareersPage() {
  const roles = siteConfig.openRoles;
  const careersEmail = getCareersEmail();
  return (
    <>
      <PageHero
        crumbs={[{ label: "Careers", href: "/careers" }]}
        eyebrow="Careers"
        title="Build the future with us"
        intro={`${siteConfig.name} is an early-stage studio. We're building a small team of thoughtful engineers and designers who care about doing great work for real people.`}
      />

      <Section labelledBy="roles-heading">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader
              id="roles-heading"
              eyebrow="Open roles"
              title={roles.length ? "Current openings" : "No open roles listed right now"}
              description={
                roles.length
                  ? "We only list roles we're actively hiring for."
                  : "We're not actively hiring at the moment, and we won't list roles that don't exist. We're always glad to hear from talented people for future opportunities."
              }
            />
          </div>
          <div className="lg:col-span-7">
            {roles.length > 0 ? (
              <ul className="divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
                {roles.map((role) => (
                  <li key={role.title}>
                    <a href={role.href} className="flex items-center justify-between gap-4 p-5 hover:bg-paper">
                      <span>
                        <span className="block font-semibold text-navy-900">{role.title}</span>
                        <span className="text-sm text-slate-600">
                          {role.type} · {role.location}
                        </span>
                      </span>
                      <ArrowUpRight aria-hidden="true" className="size-5 text-cobalt-600" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl bg-mist p-6 ring-1 ring-cobalt-100 sm:p-8">
                <h3 className="text-lg font-semibold">Interested in working with us later?</h3>
                <p className="mt-2 leading-relaxed text-slate-600">
                  Send a short note about what you do, what you&apos;d like to work on, and a link to your work (GitHub,
                  portfolio, or LinkedIn). We read everything and will reach out if a fit comes up.
                </p>
                <div className="mt-6">
                  {careersEmail ? (
                    <ButtonAnchor href={`mailto:${careersEmail}?subject=${encodeURIComponent(`Future roles at ${siteConfig.name}`)}`}>
                      <Mail aria-hidden="true" className="size-4" />
                      Email {careersEmail}
                    </ButtonAnchor>
                  ) : (
                    <ButtonLink href="/contact" arrow>
                      Get in Touch
                    </ButtonLink>
                  )}
                </div>
                {!careersEmail && (
                  <p className="mt-3 text-sm text-slate-600">
                    Use the contact form and choose &ldquo;Something else&rdquo; as the project type.
                  </p>
                )}
              </div>
            )}
          </div>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="culture-heading">
        <Container>
          <SectionHeader
            id="culture-heading"
            eyebrow="How we work"
            title="What we value in a team"
            description="We're early, so these are commitments we're building toward — and we'd love people who want to help shape them."
          />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <li key={p.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                <IconTile name={p.icon} />
                <h3 className="mt-5 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
