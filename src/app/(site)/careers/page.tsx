import type { ReactNode } from "react";
import { ArrowRight, BarChart3, Clock, Globe, Rocket, Users, Zap, type LucideIcon } from "lucide-react";
import { candidateFaqs, careersPerks, hiringSteps, workingStyle } from "@/content/jobs";
import { getTeam } from "@/content/team";
import { getOpenJobs } from "@/lib/data/jobs";
import { emailSubjects, getCareersEmail, mailtoHref, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { JobCard } from "@/components/careers/job-card";
import { CareersHeroVisual, RemoteCallVisual } from "@/components/careers/illustrations";
import { TeamAvatar } from "@/components/team/team-card";

export const metadata = buildMetadata({
  title: "Careers — Build Meaningful Products. Work From Anywhere.",
  description: `Join ${siteConfig.name}, a small, fully remote team building software that makes a difference. See open roles, how we work, and our one-interview hiring process.`,
  path: "/careers",
});

const heroFacts: [LucideIcon, string, string?][] = [
  [Users, "Small team"],
  [Globe, "Fully remote"],
  [Clock, "Flexible hours", "(U.S. overlap)"],
];
const perkStyles: [LucideIcon, string][] = [
  [Users, "bg-violet-50 text-violet-700"],
  [Zap, "bg-emerald-50 text-emerald-700"],
  [Rocket, "bg-rose-50 text-rose-700"],
  [BarChart3, "bg-amber-50 text-amber-700"],
];
const styleIcons: LucideIcon[] = [Globe, Clock, Users];

/** Content column: 1100–1200px reads better than the full site width for a recruiting page. */
const Narrow = ({ children }: { children: ReactNode }) => <div className="mx-auto max-w-6xl">{children}</div>;

/** Page band. `flush` drops the top padding so it reads as a continuation of the band above. */
function Block({ labelledBy, tone = "white", flush, children }: { labelledBy: string; tone?: "white" | "mist"; flush?: boolean; children: ReactNode }) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(tone === "mist" ? "bg-mist" : "bg-white", flush ? "pb-14 sm:pb-16 lg:pb-20" : "py-14 sm:py-16 lg:py-20")}
    >
      {children}
    </section>
  );
}

function Heading({ id, title, intro, action }: { id: string; title: string; intro?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {intro && <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default async function CareersPage() {
  const jobs = await getOpenJobs();
  const team = getTeam();
  const careersMail = mailtoHref(getCareersEmail(), emailSubjects.careersQuestion);
  const allOutsideUS = jobs.length > 0 && jobs.every((j) => j.facts.location?.includes("outside the United States"));

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="careers-title" className="relative overflow-hidden border-b border-line bg-gradient-to-b from-mist to-white">
        <Container className="py-14 sm:py-16 lg:py-20">
          <Narrow>
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <Eyebrow className="mb-4">Careers at {siteConfig.name}</Eyebrow>
                <h1 id="careers-title" className="text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
                  Build Meaningful Products. <span className="block text-cobalt-600">Work From Anywhere.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                  Join a small, fully remote team that values great engineering, clear communication, and ownership.
                  We&apos;re looking for curious people who want to solve real problems and make a difference.
                </p>
                <div className="mt-8">
                  <ButtonLink href="#open-roles" size="lg" arrow>
                    View Open Positions
                  </ButtonLink>
                </div>
                <ul className="mt-10 flex flex-wrap gap-y-4 sm:divide-x sm:divide-line">
                  {heroFacts.map(([Icon, label, detail], i) => (
                    <li key={label} className={cn("flex items-center gap-3 pr-6", i > 0 && "sm:pl-6")}>
                      <Icon aria-hidden="true" className="size-6 shrink-0 text-cobalt-600" />
                      <span className="text-sm leading-tight text-slate-700">
                        {label}
                        {detail && <span className="block text-slate-600">{detail}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-6">
                <CareersHeroVisual />
              </div>
            </div>
          </Narrow>
        </Container>
      </section>

      {/* Open positions */}
      <Block labelledBy="roles-heading">
        <Container>
          <Narrow>
            <div id="open-roles" className="scroll-mt-24">
              <Heading
                id="roles-heading"
                title="Open Positions"
                intro={`Explore our current opportunities and find where you can make an impact.${allOutsideUS ? " All current roles are remote and open to candidates outside the United States." : ""}`}
              />
            </div>
            {jobs.length > 0 ? (
              <Reveal>
                <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <li key={job.slug}>
                      <JobCard job={job} />
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : (
              <p className="mt-8 rounded-2xl bg-paper p-6 text-slate-700 ring-1 ring-line">
                We don&apos;t have open roles right now. Check back soon, or{" "}
                <a href={careersMail} className="font-semibold text-cobalt-700 underline">
                  email our hiring team
                </a>{" "}
                to introduce yourself.
              </p>
            )}
          </Narrow>
        </Container>
      </Block>

      {/* Why join */}
      <Block labelledBy="why-heading" flush>
        <Container>
          <Narrow>
            <Heading
              id="why-heading"
              title={`Why Join ${siteConfig.name}?`}
              intro="We're a small team, but we think big. Here's what makes working with us special."
            />
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {careersPerks.map((p, i) => {
                const [Icon, tone] = perkStyles[i] ?? perkStyles[0]!;
                return (
                  <li key={p.title} className="flex gap-4">
                    <span className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-semibold leading-snug">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Narrow>
        </Container>
      </Block>

      {/* How we work */}
      <Block tone="mist" labelledBy="work-heading">
        <Container>
          <Narrow>
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Heading
                  id="work-heading"
                  title="How We Work"
                  intro="We're a fully remote team that believes great work comes from trust, responsibility, and good communication, not sitting in an office from 9 to 5."
                />
                <ul className="mt-8 grid gap-6 sm:grid-cols-3">
                  {workingStyle.map((w, i) => {
                    const Icon = styleIcons[i] ?? Globe;
                    return (
                      <li key={w.title} className="flex gap-3">
                        <Icon aria-hidden="true" className="size-7 shrink-0 text-cobalt-600" />
                        <div>
                          <h3 className="font-semibold">{w.title}</h3>
                          <p className="mt-0.5 text-sm text-slate-600">{w.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="lg:col-span-5">
                <RemoteCallVisual />
              </div>
            </div>
          </Narrow>
        </Container>
      </Block>

      {/* Hiring process */}
      <Block labelledBy="process-heading">
        <Container>
          <Narrow>
            <Heading
              id="process-heading"
              title="Our Hiring Process"
              intro="We keep hiring simple, transparent, and respectful of your time — no endless interview rounds."
            />
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {hiringSteps.map((s, i) => (
                <li key={s.title} className="relative flex gap-4 md:block">
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-cobalt-600 font-semibold text-white shadow-cta"
                    >
                      {i + 1}
                    </span>
                    {i < hiringSteps.length - 1 && <span aria-hidden="true" className="hidden h-px flex-1 bg-line-strong md:block" />}
                  </div>
                  <div className="md:mt-4 md:pr-6">
                    <h3 className="text-lg font-semibold">
                      <span className="sr-only">Step {i + 1}: </span>
                      {s.title}
                    </h3>
                    <p className="mt-1.5 leading-relaxed text-slate-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Narrow>
        </Container>
      </Block>

      {/* Team */}
      <Block labelledBy="meet-heading" flush>
        <Container>
          <Narrow>
            <Heading id="meet-heading" title="Meet Our Team" intro={`Get to know the people behind ${siteConfig.name}.`} />
            <div className="mt-10 grid items-center gap-8 lg:grid-cols-12">
              <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
                {team.map((m) => (
                  <li key={m.name} className="text-center">
                    <div className="flex justify-center">
                      <TeamAvatar member={m} size="xl" round />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{m.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-600">{m.role}</p>
                  </li>
                ))}
              </ul>
              <div className="relative overflow-hidden rounded-2xl bg-mist p-6 ring-1 ring-line lg:col-span-4">
                <Globe aria-hidden="true" className="absolute -right-6 -bottom-6 size-36 text-cobalt-100" />
                <p className="relative text-sm leading-relaxed text-slate-700">
                  We&apos;re a small team of engineers and leaders who enjoy building software together — remotely, with
                  real ownership and direct communication.
                </p>
              </div>
            </div>
          </Narrow>
        </Container>
      </Block>

      {/* FAQ */}
      <Block tone="mist" labelledBy="candidate-faq-heading">
        <Container>
          <Narrow>
            <Heading
              id="candidate-faq-heading"
              title="Frequently Asked Questions"
              intro={`Here are some common questions about working at ${siteConfig.name}.`}
              action={
                <a href={careersMail} className="inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-700 hover:text-cobalt-800">
                  Email our hiring team
                  <ArrowRight aria-hidden="true" className="size-4" />
                </a>
              }
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {candidateFaqs.map((f) => (
                <li key={f.question} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                  <h3 className="text-sm font-semibold leading-snug">{f.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.answer}</p>
                </li>
              ))}
            </ul>
          </Narrow>
        </Container>
      </Block>

      {/* Closing call to action */}
      <Block labelledBy="cta-heading">
        <Container>
          <Narrow>
            <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-cobalt-50 to-mist px-6 py-10 ring-1 ring-cobalt-100 sm:px-10 md:flex-row md:items-center md:justify-between">
              <div>
                <Eyebrow className="mb-2">Ready to build what&apos;s next?</Eyebrow>
                <h2 id="cta-heading" className="text-3xl font-bold tracking-tight">
                  Explore Open Positions
                </h2>
                <p className="mt-2 text-slate-600">Join a small, fully remote team and make a meaningful impact.</p>
              </div>
              <ButtonLink href="#open-roles" size="lg" arrow className="shrink-0">
                View Open Positions
              </ButtonLink>
            </div>
          </Narrow>
        </Container>
      </Block>
    </>
  );
}
