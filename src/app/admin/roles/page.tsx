import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/session";
import { listCandidates } from "@/lib/data/candidates";
import { readJobs } from "@/lib/data/jobs";
import { createRedis } from "@/lib/data/redis";
import { readIntakeEnv } from "@/lib/integrations/env";
import { buttonClasses } from "@/components/ui/button";
import { AdminLoading, AdminPage, EmptyState, formatDate, Pill } from "@/components/admin/ui";
import { setJobStatusAction } from "../actions";

export const metadata = { title: "Roles" };

export default function RolesPage(props: PageProps<"/admin/roles">) {
  return (
    <Suspense fallback={<AdminLoading label="Loading roles…" />}>
      <Roles {...props} />
    </Suspense>
  );
}

async function Roles({ searchParams }: PageProps<"/admin/roles">) {
  await requireAdmin();
  const saved = (await searchParams).saved;
  const redis = createRedis(readIntakeEnv());
  if (!redis) {
    return (
      <AdminPage title="Roles">
        <EmptyState>Storage isn&apos;t configured for this environment, so roles can&apos;t be edited here.</EmptyState>
      </AdminPage>
    );
  }
  const [jobs, candidates] = await Promise.all([readJobs(redis), listCandidates(redis)]);
  const applicants = (slug: string) => candidates.filter((c) => c.data.role === slug).length;
  const ordered = [...jobs].sort((a, b) => (a.status === b.status ? b.updatedAt.localeCompare(a.updatedAt) : a.status === "open" ? -1 : 1));

  return (
    <AdminPage
      title="Roles"
      description="Post new roles, edit descriptions, and withdraw or re-open roles. Changes appear on the careers pages within seconds."
      actions={
        <Link href="/admin/roles/new" className={buttonClasses()}>
          <Plus aria-hidden="true" className="size-4" />
          Post a new role
        </Link>
      }
    >
      {typeof saved === "string" && (
        <p role="status" className="mb-6 rounded-xl bg-success-50 p-4 text-sm font-medium text-success-700 ring-1 ring-success-700/20">
          Saved. The careers pages are updated.
        </p>
      )}
      {ordered.length === 0 ? (
        <EmptyState>No roles yet. Post your first role to start accepting applications.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {ordered.map((j) => {
            const open = j.status === "open";
            const count = applicants(j.slug);
            return (
              <li key={j.slug} className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={j.status}>{open ? "Open — accepting applications" : "Withdrawn"}</Pill>
                    <span className="text-xs text-slate-600">{j.team}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{j.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    <Link href={`/admin/candidates?role=${encodeURIComponent(j.slug)}`} className="font-medium text-cobalt-700 hover:underline">
                      {count} applicant{count === 1 ? "" : "s"}
                    </Link>{" "}
                    · Updated {formatDate(j.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/roles/${j.slug}/edit`} className={buttonClasses({ variant: "secondary" })}>
                    Edit
                  </Link>
                  <form action={setJobStatusAction.bind(null, j.slug, open ? "closed" : "open")}>
                    <button type="submit" className={buttonClasses({ variant: open ? "ghost" : "primary" })}>
                      {open ? "Withdraw" : "Re-open"}
                    </button>
                  </form>
                  <a href={`/careers/${j.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "ghost" })}>
                    View
                    <ExternalLink aria-hidden="true" className="size-4" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminPage>
  );
}
