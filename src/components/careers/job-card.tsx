import Link from "next/link";
import { applyHref, UNCONFIRMED_DETAIL, type Job } from "@/content/jobs";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";

export function JobFacts({ job, className }: { job: Job; className?: string }) {
  const rows: [string, string][] = [
    ["Location", job.facts.location ?? UNCONFIRMED_DETAIL],
    ["Employment type", job.facts.employmentType ?? UNCONFIRMED_DETAIL],
    ["Compensation", job.facts.compensation ?? UNCONFIRMED_DETAIL],
  ];
  return (
    <dl className={className ?? "grid gap-3 text-sm sm:grid-cols-3"}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs font-semibold tracking-wide text-slate-600 uppercase">{k}</dt>
          <dd className="mt-0.5 text-navy-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function JobCard({ job }: { job: Job }) {
  const id = `job-${job.slug}`;
  return (
    <article aria-labelledby={id} className="flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-line shadow-soft sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="blue">{job.team}</Badge>
        <Badge>Actively recruiting</Badge>
      </div>
      <h3 id={id} className="mt-4 text-xl font-semibold leading-snug">
        <Link href={`/careers/${job.slug}`} className="hover:text-cobalt-700">
          {job.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 leading-relaxed text-slate-600">{job.summary}</p>
      <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Key skills">
        {job.skills.map((s) => (
          <li key={s}>
            <Badge>{s}</Badge>
          </li>
        ))}
      </ul>
      <p className="mt-6 border-t border-line pt-5 text-sm text-slate-600">
        {job.facts.location || job.facts.employmentType || job.facts.compensation ? (
          [job.facts.location, job.facts.employmentType, job.facts.compensation].filter(Boolean).join(" · ")
        ) : (
          <>
            <span className="font-semibold text-navy-900">Location, employment type &amp; pay:</span>{" "}
            {UNCONFIRMED_DETAIL.toLowerCase()}
          </>
        )}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={`/careers/${job.slug}`} aria-label={`View Role: ${job.title}`} className={buttonClasses({ variant: "secondary" })}>
          View Role
        </Link>
        <Link href={applyHref(job.slug)} aria-label={`Apply for ${job.title}`} className={buttonClasses()}>
          Apply
        </Link>
      </div>
    </article>
  );
}
