import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { getAdminSession } from "@/lib/admin/session";
import { LogoMark } from "@/components/ui/logo";
import { Container } from "@/components/ui/primitives";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s | ${siteConfig.name} Admin` },
  robots: { index: false, follow: false },
};

/** Private admin area. Separate from the public site chrome; every page and action verifies the session itself. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="bg-navy-950 text-white">
        <Container className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
          <Link href="/admin/candidates" className="inline-flex items-center gap-2.5 rounded-lg">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight">
              {siteConfig.name} <span className="font-medium text-cobalt-200">Admin</span>
            </span>
          </Link>
          <Suspense fallback={null}>
            <AdminNav />
          </Suspense>
        </Container>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
    </div>
  );
}

async function AdminNav() {
  const session = await getAdminSession();
  if (!session) return null;
  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      <Link href="/admin/candidates" className="font-semibold hover:text-cobalt-200">
        Candidates
      </Link>
      <Link href="/admin/roles" className="font-semibold hover:text-cobalt-200">
        Roles
      </Link>
      <Link href="/" className="text-slate-300 hover:text-white">
        View site
      </Link>
      <span className="hidden text-slate-400 sm:inline" title="Signed in">
        {session.email}
      </span>
      <form action={signOutAction}>
        <button type="submit" className="rounded-lg px-3 py-1.5 font-semibold ring-1 ring-white/25 hover:bg-white/10">
          Sign out
        </button>
      </form>
    </nav>
  );
}
