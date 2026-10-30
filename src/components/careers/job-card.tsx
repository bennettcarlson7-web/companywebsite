import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { applyHref, UNCONFIRMED_DETAIL, type Job } from "@/content/jobs";
import { buttonClasses } from "@/components/ui/button";

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

/**
 * One open position as a compact card: the whole card opens the role page; the terms candidates scan for first
 * (type, workplace, pay) sit in chips, and Apply goes straight to the form with the role preselected.
 */
export function JobCard({ job }: { job: Job }) {
  const id = `job-${job.slug}`;
  const chips = [job.facts.employmentType, job.facts.workplace, job.facts.compensation].filter((c): c is string => !!c);
  return (
    <article
      aria-labelledby={id}
      className="group relative flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-line transition-shadow hover:shadow-soft hover:ring-cobalt-200"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg leading-snug font-semibold">
          <Link
            href={`/careers/${job.slug}`}
            aria-label={`View Role: ${job.title}`}
            className="after:absolute after:inset-0 after:rounded-2xl group-hover:text-cobalt-700"
          >
            <span id={id}>{job.title}</span>
          </Link>
        </h3>
        <ArrowRight aria-hidden="true" className="mt-1 size-5 shrink-0 text-navy-900 transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{job.summary}</p>
      <ul className="mt-4 mb-5 flex flex-wrap gap-2" aria-label="Terms">
        {chips.map((c) => (
          <li key={c} className="rounded-md bg-paper px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-line ring-inset">
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-4">
        <p className="flex gap-1.5 text-xs leading-relaxed text-slate-600">
          <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-cobalt-600" />
          {job.facts.location ?? UNCONFIRMED_DETAIL}
        </p>
        <Link
          href={applyHref(job.slug)}
          aria-label={`Apply for ${job.title}`}
          className={buttonClasses({ className: "relative z-10 min-h-9 shrink-0 px-4" })}
        >
          Apply
        </Link>
      </div>
    </article>
  );
}
