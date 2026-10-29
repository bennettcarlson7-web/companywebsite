import { candidateFaqs, engineeringValues, getJobs } from "@/content/jobs";
import { emailSubjects, getCareersEmail, mailtoHref, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { FAQAccordion } from "@/components/sections/faq";
import { JobCard } from "@/components/careers/job-card";

export const metadata = buildMetadata({
  title: "Careers — Help Build What's Next",
  description: `${siteConfig.name} is recruiting a Senior Software Engineer (AI/ML), a Senior Software Engineer (Data Engineering), and a Talent Recruiter. Explore the roles and apply.`,
  path: "/careers",
});

export default function CareersPage() {
  const jobs = getJobs();
  return (
    <>
      <PageHero
        crumbs={[{ label: "Careers", href: "/careers" }]}
        eyebrow="Careers"
        title="Help build what's next."
        intro="We're growing a thoughtful team to turn ambitious ideas into reliable software. Explore the roles we're recruiting for."
        actions={
          <ButtonLink href="#open-roles" size="lg" arrow>
            See Open Roles
          </ButtonLink>
        }
      />

      <Section labelledBy="roles-heading" className="scroll-mt-20">
        <Container>
          <div id="open-roles" className="scroll-mt-24">
            <SectionHeader
              id="roles-heading"
              eyebrow={`${jobs.length} open roles`}
              title="Roles we're recruiting for"
              description="Each role has its own page with the details. Applying takes a few minutes — your résumé and a short introduction video are all we ask for."
            />
          </div>
          <Reveal>
            <ul className="mt-10 grid gap-6 lg:grid-cols-3">
              {jobs.map((job) => (
                <li key={job.slug}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="culture-heading">
        <Container>
          <SectionHeader
            id="culture-heading"
            eyebrow="How we work"
            title="What we care about as an engineering team"
            description="These are the standards we hold ourselves to on client work — and what we're looking for in the people who join us."
          />
          <Reveal>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {engineeringValues.map((v) => (
                <li key={v.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section labelledBy="candidate-faq-heading">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="candidate-faq-heading" eyebrow="FAQ" title="Questions from candidates" />
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>
                Have a question before applying?{" "}
                <a
                  href={mailtoHref(getCareersEmail(), emailSubjects.careersQuestion)}
                  className="font-semibold text-cobalt-700 underline underline-offset-2"
                >
                  Email our hiring team
                </a>
                .
              </p>
            </div>
          </div>
          <div className="lg:col-span-8">
            <FAQAccordion faqs={candidateFaqs} />
          </div>
        </Container>
      </Section>
    </>
  );
}
