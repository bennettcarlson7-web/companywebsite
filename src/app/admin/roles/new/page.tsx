import { Suspense } from "react";
import { defaultJobFacts } from "@/content/jobs";
import { requireAdmin } from "@/lib/admin/session";
import { AdminLoading, AdminPage, Panel } from "@/components/admin/ui";
import { JobForm } from "@/components/admin/job-form";

export const metadata = { title: "Post a role" };

export default function NewRolePage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <NewRole />
    </Suspense>
  );
}

async function NewRole() {
  await requireAdmin();
  return (
    <AdminPage title="Post a new role" description="The role gets its own page at /careers/… and appears in the application form.">
      <Panel className="max-w-3xl">
        <JobForm
          slug={null}
          values={{
            title: "",
            shortTitle: "",
            team: "Engineering",
            summary: "",
            location: defaultJobFacts.location ?? "",
            employmentType: defaultJobFacts.employmentType ?? "",
            compensation: defaultJobFacts.compensation ?? "",
            overview: "",
            workOn: "",
            lookingFor: "",
            niceToHave: "",
            skills: "",
          }}
        />
      </Panel>
    </AdminPage>
  );
}
