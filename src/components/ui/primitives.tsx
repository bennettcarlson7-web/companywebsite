import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Section({
  id,
  className,
  children,
  tone = "white",
  labelledBy,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  tone?: "white" | "mist" | "paper";
  labelledBy?: string;
}) {
  const tones = { white: "bg-white", mist: "bg-mist", paper: "bg-paper" };
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-16 sm:py-20 lg:py-24", tones[tone], className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow", className)}>
      <span aria-hidden="true" className="h-3.5 w-0.5 rounded-full bg-cobalt-600" />
      {children}
    </p>
  );
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  action,
  align = "left",
  as: Heading = "h2",
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow className={cn("mb-3", align === "center" && "justify-center")}>{eyebrow}</Eyebrow>}
        <Heading id={id} className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </Heading>
        {description && <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "blue" | "amber" }) {
  const tones = {
    neutral: "bg-paper text-slate-700 ring-line",
    blue: "bg-cobalt-50 text-cobalt-700 ring-cobalt-100",
    amber: "bg-warning-50 text-warning-800 ring-warning-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>
      {children}
    </span>
  );
}

/** Visible label for illustrative (non-client) portfolio work. */
export function ConceptBadge() {
  return (
    <Badge tone="amber">
      <span className="font-semibold">Concept</span>
      <span aria-hidden="true" className="mx-1">·</span>
      Illustrative project
    </Badge>
  );
}

export function Notice({ title, children, tone = "info" }: { title: string; children: ReactNode; tone?: "info" | "draft" }) {
  return (
    <aside
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        tone === "draft"
          ? "border-warning-200 bg-warning-50 text-warning-800"
          : "border-cobalt-100 bg-cobalt-50 text-navy-800",
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </aside>
  );
}

export function CheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-slate-700">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 text-cobalt-600">
            <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.12" />
            <path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
