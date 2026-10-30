import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdminEnabled } from "@/lib/admin/config";
import { getAdminSession } from "@/lib/admin/session";
import { isEmailConfigured, readIntakeEnv } from "@/lib/integrations/env";
import { Container } from "@/components/ui/primitives";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-md rounded-[1.75rem] bg-white p-6 shadow-card ring-1 ring-line sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Admin</h1>
        <p className="mt-2 text-slate-600">Manage candidates and job postings.</p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
            <LoginGate />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}

async function LoginGate() {
  if (await getAdminSession()) redirect("/admin/candidates");
  if (!isAdminEnabled() || !isEmailConfigured(readIntakeEnv())) {
    return (
      <p role="status" className="rounded-xl bg-warning-50 p-4 text-sm text-warning-800 ring-1 ring-warning-200">
        Admin sign-in isn&apos;t set up for this website yet. It needs an admin email (ADMIN_EMAILS or HIRING_EMAIL), a
        session key (ADMIN_SESSION_SECRET or Upstash storage), and email sending. See docs/ADMIN.md.
      </p>
    );
  }
  return <LoginForm />;
}
