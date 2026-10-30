import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { applyHref, engineeringValues, excludesUS } from "@/content/jobs";
import { getAllJobs, getJobBySlug, isOpen } from "@/lib/data/jobs";
import { buildMetadata, JsonLd, jobPostingJsonLd } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { Badge, CheckList, Container, Section } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JobFacts } from "@/components/careers/job-card";

// Static pages from cached job data. Roles posted later are generated on first visit; admin changes refresh
// them through the "jobs" cache tag. Unknown slugs render the 404 page.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getAllJobs()).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  return {
    ...buildMetadata({ title: `${job.title} — Careers`, description: job.summary, path: `/careers/${slug}` }),
    // A withdrawn role stays reachable for people with the link, but shouldn't be found in search.
    ...(isOpen(job) ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function JobPage({ params }: PageProps<"/careers/[slug]">) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const open = isOpen(job);
  const otherJobs = (await getAllJobs()).filter((j) => j.slug !== job.slug && isOpen(j));

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-mist to-white">
        <Container className="py-12 sm:py-16">
          <Breadcrumbs
            items={[
              { label: "Careers", href: "/careers" },
              { label: job.title, href: `/careers/${job.slug}` },
            ]}
          />
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge tone="blue">{job.team}</Badge>
            <Badge>{open ? "Actively recruiting" : "Closed"}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">{job.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{job.summary}</p>
          {!open && (
            <p role="status" className="mt-6 max-w-2xl rounded-xl bg-warning-50 p-4 font-medium text-warning-800 ring-1 ring-warning-200">
              This role is no longer accepting applications. See our other open roles below.
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {open && (
              <ButtonLink href={applyHref(job.slug)} size="lg" arrow>
                Apply Now
              </ButtonLink>
            )}
            <ButtonLink href="/careers" size="lg" variant={open ? "secondary" : "primary"}>
              All Open Roles
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="grid gap-12 lg:grid-cols-12">
          <article className="space-y-12 lg:col-span-8">
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-2xl font-semibold tracking-tight">
                The role
              </h2>
              <div className="mt-4 space-y-4 text-[1.0625rem] leading-relaxed text-slate-700">
                {job.overview.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </section>

            <section aria-labelledby="work-heading">
              <h2 id="work-heading" className="text-2xl font-semibold tracking-tight">
                What you&apos;d work on
              </h2>
              <CheckList items={job.workOn} className="mt-5" />
            </section>

            <section aria-labelledby="looking-heading">
              <h2 id="looking-heading" className="text-2xl font-semibold tracking-tight">
                What we&apos;re looking for
              </h2>
              <CheckList items={job.lookingFor} className="mt-5" />
            </section>

            <section aria-labelledby="nice-heading">
              <h2 id="nice-heading" className="text-2xl font-semibold tracking-tight">
                Nice to have
              </h2>
              <p className="mt-2 text-slate-600">Helpful, not required. Nobody has all of these.</p>
              <ul className="mt-4 space-y-2 text-slate-700">
                {job.niceToHave.map((n) => (
                  <li key={n} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-cobalt-400" />
                    {n}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="values-heading">
              <h2 id="values-heading" className="text-2xl font-semibold tracking-tight">
                How we work
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {engineeringValues.slice(0, 4).map((v) => (
                  <li key={v.title} className="rounded-2xl bg-paper p-5 ring-1 ring-line">
                    <h3 className="font-semibold">{v.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{v.body}</p>
                  </li>
                ))}
              </ul>
            </section>

            <p className="rounded-xl bg-paper p-4 text-sm leading-relaxed text-slate-600 ring-1 ring-line">
              This description reflects our current thinking about the role and may be refined as we talk with
              candidates.{excludesUS(job) ? " This role is open to candidates outside the United States." : ""}{" "}
              All terms are confirmed in writing before any offer.
            </p>
          </article>

          <aside className="lg:col-span-4">
            <div className="space-y-6 rounded-2xl bg-white p-6 ring-1 ring-line shadow-soft lg:sticky lg:top-24">
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">Role details</h2>
                <JobFacts job={job} className="mt-4 grid gap-4 text-sm" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">Key skills</h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <li key={s}>
                      <Badge>{s}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              {open && (
                <div className="border-t border-line pt-6">
                  <ButtonLink href={applyHref(job.slug)} className="w-full" arrow>
                    Apply for This Role
                  </ButtonLink>
                </div>
              )}
            </div>
          </aside>
        </Container>
      </Section>

      {otherJobs.length > 0 && (
        <Section tone="mist" labelledBy="other-roles-heading">
          <Container>
            <h2 id="other-roles-heading" className="text-2xl font-semibold tracking-tight">
              Other open roles
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {otherJobs.map((j) => (
                <li key={j.slug}>
                  <Link
                    href={`/careers/${j.slug}`}
                    className="flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-line transition-shadow hover:shadow-card"
                  >
                    <span className="font-semibold text-navy-900">{j.title}</span>
                    <span className="mt-1 text-sm text-slate-600">{j.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
      {open && <JsonLd data={jobPostingJsonLd(job)} />}
    </>
  );
}
