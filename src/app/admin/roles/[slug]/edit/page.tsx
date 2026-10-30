import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { readJobs } from "@/lib/data/jobs";
import { createRedis } from "@/lib/data/redis";
import { readIntakeEnv } from "@/lib/integrations/env";
import { AdminLoading, AdminPage, Panel } from "@/components/admin/ui";
import { JobForm } from "@/components/admin/job-form";

export const metadata = { title: "Edit role" };

export default function EditRolePage(props: PageProps<"/admin/roles/[slug]/edit">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditRole {...props} />
    </Suspense>
  );
}

async function EditRole({ params }: PageProps<"/admin/roles/[slug]/edit">) {
  await requireAdmin();
  const { slug } = await params;
  const job = (await readJobs(createRedis(readIntakeEnv()))).find((j) => j.slug === slug);
  if (!job) notFound();

  return (
    <AdminPage title={`Edit: ${job.title}`} description={`Public page: /careers/${job.slug} (the address stays the same when you edit).`}>
      <Panel className="max-w-3xl">
        <JobForm
          slug={job.slug}
          values={{
            title: job.title,
            shortTitle: job.shortTitle === job.title ? "" : job.shortTitle,
            team: job.team,
            summary: job.summary,
            location: job.facts.location ?? "",
            employmentType: job.facts.employmentType ?? "",
            compensation: job.facts.compensation ?? "",
            overview: job.overview.join("\n\n"),
            workOn: job.workOn.join("\n"),
            lookingFor: job.lookingFor.join("\n"),
            niceToHave: job.niceToHave.join("\n"),
            skills: job.skills.join(", "),
          }}
        />
      </Panel>
    </AdminPage>
  );
}
