import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin/session";
import { candidateStatuses, getCandidate, statusOf } from "@/lib/data/candidates";
import { createRedis } from "@/lib/data/redis";
import { readIntakeEnv } from "@/lib/integrations/env";
import { ageRangeOptions, genderOptions } from "@/lib/validation/job-application";
import { buttonClasses } from "@/components/ui/button";
import { AdminLoading, AdminPage, formatDate, Panel, Pill } from "@/components/admin/ui";
import { DeleteCandidateButton, ReviewForm } from "@/components/admin/candidate-actions";

export const metadata = { title: "Candidate" };

export default function CandidatePage(props: PageProps<"/admin/candidates/[id]">) {
  return (
    <Suspense fallback={<AdminLoading label="Loading candidate…" />}>
      <CandidateDetail {...props} />
    </Suspense>
  );
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const label = (opts: readonly { value: string; label: string }[], v: unknown) =>
  !v || v === "decline" ? "Not disclosed" : (opts.find((o) => o.value === v)?.label ?? str(v));
const kb = (n: unknown) => (typeof n === "number" ? (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`) : "");

/** Only https links are rendered as links (they were validated on submit; this is defense in depth). */
function SafeLink({ href }: { href: string }) {
  if (!/^https:\/\//i.test(href)) return <span>{href || "—"}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 break-all font-medium text-cobalt-700 underline underline-offset-2">
      {href}
      <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

async function CandidateDetail({ params }: PageProps<"/admin/candidates/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const redis = createRedis(readIntakeEnv());
  const c = redis ? await getCandidate(redis, id) : null;
  if (!c) notFound();

  const d = c.data;
  const name = str(d.name) || "Unnamed candidate";
  const status = statusOf(c);
  const resume = d.resume as { filename?: string; size?: number } | undefined;
  const rows: [string, ReactNode][] = [
    ["Role", str(d.roleTitle) || str(d.role)],
    ["Email", <a key="e" href={`mailto:${str(d.email)}`} className="font-medium text-cobalt-700 underline underline-offset-2">{str(d.email)}</a>],
    ["Phone", str(d.phone) ? <a key="p" href={`tel:${str(d.phone).replace(/[^\d+]/g, "")}`} className="font-medium text-cobalt-700 underline underline-offset-2">{str(d.phone)}</a> : "—"],
    ["Location", [str(d.city), str(d.countryName) || str(d.country)].filter(Boolean).join(", ") || "—"],
    ["LinkedIn", <SafeLink key="l" href={str(d.linkedinUrl)} />],
    ["Introduction video", <SafeLink key="v" href={str(d.videoUrl)} />],
    ["Portfolio / GitHub", str(d.portfolioUrl) ? <SafeLink key="g" href={str(d.portfolioUrl)} /> : "—"],
    ["Gender", label(genderOptions, d.gender)],
    ["Age range", label(ageRangeOptions, d.ageRange)],
    ["Received", formatDate(c.receivedAt)],
  ];

  return (
    <AdminPage
      title={name}
      description={<Pill tone={status}>{candidateStatuses.find((s) => s.value === status)?.label}</Pill>}
      actions={
        <Link href="/admin/candidates" className={buttonClasses({ variant: "secondary" })}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          All candidates
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Panel>
            <h2 className="text-lg font-semibold">Application</h2>
            <dl className="mt-4 divide-y divide-line">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-3">
                  <dt className="text-sm font-semibold text-slate-600">{k}</dt>
                  <dd className="text-sm text-navy-900 sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          {str(d.introduction) && (
            <Panel>
              <h2 className="text-lg font-semibold">Introduction</h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{str(d.introduction)}</p>
            </Panel>
          )}
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Panel>
            <h2 className="text-lg font-semibold">Résumé</h2>
            {resume?.filename ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm">
                  <span className="font-medium text-navy-900">{resume.filename}</span>{" "}
                  <span className="text-slate-600">{kb(resume.size)}</span>
                </span>
                {/* A plain link (not next/link): it's a file download from a route handler. */}
                <a href={`/admin/candidates/${c.id}/resume`} className={buttonClasses()}>
                  <Download aria-hidden="true" className="size-4" />
                  Download
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                {str(d.resumeUrl) ? <SafeLink href={str(d.resumeUrl)} /> : "No résumé file on this application."}
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="text-lg font-semibold">Review</h2>
            <div className="mt-4">
              <ReviewForm id={c.id} status={status} notes={c.review?.notes ?? ""} statuses={candidateStatuses} />
            </div>
            {c.review && (
              <p className="mt-4 text-xs text-slate-600">
                Last updated {formatDate(c.review.updatedAt)} by {c.review.updatedBy}
              </p>
            )}
          </Panel>

          <Panel className="ring-danger-600/20">
            <h2 className="text-lg font-semibold">Delete</h2>
            <p className="mt-2 text-sm text-slate-600">
              Use this when a candidate asks for their data to be removed. It permanently deletes the application, résumé,
              and notes.
            </p>
            <div className="mt-3">
              <DeleteCandidateButton id={c.id} name={name} />
            </div>
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
