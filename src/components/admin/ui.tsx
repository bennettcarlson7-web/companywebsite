import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/primitives";

/** Small building blocks shared by admin pages. */

export function AdminPage({ title, description, actions, children }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 text-slate-600">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6", className)}>{children}</div>;
}

const pillTones = {
  new: "bg-cobalt-50 text-cobalt-700 ring-cobalt-200",
  reviewing: "bg-amber-50 text-amber-800 ring-amber-200",
  interview: "bg-violet-50 text-violet-800 ring-violet-200",
  offer: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  hired: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  rejected: "bg-slate-100 text-slate-700 ring-slate-200",
  open: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  closed: "bg-slate-100 text-slate-700 ring-slate-200",
} as const;

export function Pill({ tone, children }: { tone: keyof typeof pillTones; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", pillTones[tone])}>
      {children}
    </span>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <Container className="py-10">
      <div role="status" aria-live="polite" className="animate-pulse space-y-4">
        <span className="sr-only">{label}</span>
        <div className="h-8 w-56 rounded-lg bg-line" />
        <div className="h-4 w-80 rounded bg-line/70" />
        <div className="mt-8 h-64 rounded-2xl bg-white ring-1 ring-line" />
      </div>
    </Container>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-white p-8 text-center text-slate-600 ring-1 ring-line">{children}</p>;
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
