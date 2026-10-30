import type { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  Filter,
  Home,
  Inbox,
  LayoutGrid,
  MessageSquare,
  Package,
  Plus,
  Search,
  Settings,
  Sparkles,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { isReleased, type Product } from "@/content/products";
import { cn } from "@/lib/utils";

/**
 * Design previews of NextMade's products, drawn in code. They show the intended interface while the products are
 * in development and are always captioned as previews — never presented as screenshots. Sample data is fictional.
 * Layouts respond to their own width (container queries), so the same preview works in a card or full width.
 */

function Frame({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("@container overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line", className)}>
      <div className="flex items-center gap-3 border-b border-line bg-paper px-3 py-2">
        <span className="flex gap-1">
          <span className="size-2 rounded-full bg-rose-300" />
          <span className="size-2 rounded-full bg-amber-300" />
          <span className="size-2 rounded-full bg-emerald-300" />
        </span>
        <span className="truncate rounded-md bg-white px-2 py-0.5 text-[0.6rem] font-medium text-slate-600 ring-1 ring-line">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Rail({ icons, active }: { icons: LucideIcon[]; active: number }) {
  return (
    <div className="hidden w-11 shrink-0 flex-col items-center gap-2 border-r border-line bg-paper py-3 @lg:flex">
      {icons.map((Icon, i) => (
        <span
          key={i}
          className={cn("inline-flex size-7 items-center justify-center rounded-lg", i === active ? "bg-cobalt-600 text-white" : "text-slate-500")}
        >
          <Icon className="size-3.5" />
        </span>
      ))}
    </div>
  );
}

const initials = (s: string) =>
  s
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ── ClientFlow AI: lead pipeline with AI analysis ───────────────────────────── */

const pipeline: { stage: string; tone: string; leads: [string, string, string, number][] }[] = [
  {
    stage: "New",
    tone: "bg-violet-600",
    leads: [
      ["Northwind Dental", "Booking app", "$12,500", 92],
      ["Pinecrest Legal", "Client portal", "$8,750", 78],
      ["BlueSky Logistics", "Ops dashboard", "$15,200", 85],
    ],
  },
  {
    stage: "Contacted",
    tone: "bg-cobalt-600",
    leads: [
      ["Apex Fitness", "Mobile app", "$18,400", 88],
      ["Brightside Clinic", "AI intake", "$7,600", 81],
    ],
  },
  {
    stage: "Qualified",
    tone: "bg-emerald-700",
    leads: [
      ["Greenfield Supply", "Integrations", "$22,000", 94],
      ["Lighthouse Realty", "CRM automation", "$13,800", 86],
    ],
  },
  {
    stage: "Proposal",
    tone: "bg-amber-700",
    leads: [
      ["Stratus Energy", "Data platform", "$25,000", 90],
      ["ClearPath Schools", "Web platform", "$17,300", 83],
    ],
  },
];

function ClientFlowPreview() {
  return (
    <Frame title="ClientFlow AI — Leads">
      <div className="flex">
        <Rail icons={[Home, Users, LayoutGrid, FileText, CreditCard, BarChart3, Settings]} active={2} />
        <div className="min-w-0 flex-1 p-3 @lg:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-navy-900">Leads</p>
              <span className="hidden rounded-md p-0.5 text-[0.6rem] ring-1 ring-line @md:flex">
                <span className="px-1.5 py-0.5 text-slate-600">Table</span>
                <span className="rounded bg-cobalt-50 px-1.5 py-0.5 font-semibold text-cobalt-700">Kanban</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden items-center gap-1 rounded-md px-2 py-1 text-[0.6rem] text-slate-600 ring-1 ring-line @xl:flex">
                <Filter className="size-3" /> Filters
              </span>
              <span className="flex items-center gap-1 rounded-md bg-cobalt-600 px-2 py-1 text-[0.6rem] font-semibold text-white">
                <Plus className="size-3" /> New lead
              </span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 @xl:grid-cols-3 @3xl:grid-cols-4">
            {pipeline.map((col, ci) => (
              <div key={col.stage} className={cn("rounded-xl bg-paper p-1.5 ring-1 ring-line", ci === 2 && "hidden @xl:block", ci === 3 && "hidden @3xl:block")}>
                <div className={cn("flex items-center justify-between rounded-lg px-2 py-1 text-[0.62rem] font-semibold text-white", col.tone)}>
                  {col.stage}
                  <span className="rounded bg-white/20 px-1">{col.leads.length}</span>
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {col.leads.map(([company, need, value, fit], li) => (
                    <div
                      key={company}
                      className={cn("rounded-lg bg-white p-2 ring-1 ring-line", ci === 0 && li === 0 && "ring-2 ring-cobalt-300")}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="truncate text-[0.62rem] font-semibold text-navy-900">{company}</p>
                        <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[0.45rem] font-semibold text-slate-700">
                          {initials(company)}
                        </span>
                      </div>
                      <p className="truncate text-[0.55rem] text-slate-600">{need}</p>
                      <div className="mt-1.5 flex items-center justify-between gap-1">
                        <span className="rounded bg-amber-50 px-1 text-[0.55rem] font-semibold text-amber-800">{value}</span>
                        <span className="flex items-center gap-0.5 rounded bg-violet-50 px-1 text-[0.55rem] font-semibold text-violet-700">
                          <Sparkles className="size-2.5" />
                          {fit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 hidden rounded-xl bg-violet-50 p-2.5 ring-1 ring-violet-100 @2xl:block">
            <p className="flex items-center gap-1 text-[0.62rem] font-semibold text-violet-800">
              <Sparkles className="size-3" /> AI analysis · Northwind Dental
            </p>
            <p className="mt-1 text-[0.58rem] leading-relaxed text-slate-700">
              Wants online booking for 3 clinics. Budget about $10–15k, launch in 8 weeks. Strong fit for a mobile booking MVP.
              Suggested next step: book a discovery call.
            </p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── CommercePilot AI: support inbox with order context ──────────────────────── */

const tickets: [string, string, string, string][] = [
  ["#1042", "Where is my order?", "Shipping", "Open"],
  ["#1041", "Wrong size, want to exchange", "Returns", "Pending"],
  ["#1040", "Charged twice at checkout", "Billing", "Escalated"],
  ["#1039", "Discount code not working", "Checkout", "Resolved"],
  ["#1038", "Change delivery address", "Shipping", "Resolved"],
  ["#1037", "Item arrived damaged", "Returns", "Open"],
];
const statusTone: Record<string, string> = {
  Open: "bg-success-50 text-success-700",
  Pending: "bg-amber-50 text-amber-800",
  Escalated: "bg-danger-50 text-danger-700",
  Resolved: "bg-cobalt-50 text-cobalt-700",
};

function CommercePilotPreview() {
  return (
    <Frame title="CommercePilot AI — Support inbox">
      <div className="flex">
        <Rail icons={[Inbox, MessageSquare, Package, BarChart3, Settings]} active={0} />
        <div className="min-w-0 flex-1 border-r border-line p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-navy-900">All tickets</p>
            <span className="flex items-center gap-1 rounded-md px-2 py-1 text-[0.6rem] text-slate-500 ring-1 ring-line">
              <Search className="size-3" /> Search
            </span>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {tickets.map(([id, title, cat, status], i) => (
              <li key={id} className={cn("flex items-center gap-2 px-1 py-1.5", i === 0 && "rounded-md bg-cobalt-50/60")}>
                <span className="w-7 shrink-0 text-[0.55rem] text-slate-600">{id}</span>
                <span className="min-w-0 flex-1 truncate text-[0.62rem] font-medium text-navy-900">{title}</span>
                <span className="hidden shrink-0 rounded bg-paper px-1.5 text-[0.55rem] text-slate-600 ring-1 ring-line @md:inline">{cat}</span>
                <span className={cn("shrink-0 rounded px-1.5 text-[0.55rem] font-semibold", statusTone[status])}>{status}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden w-[44%] shrink-0 space-y-2 p-3 @xl:block">
          <div className="flex items-center justify-between">
            <p className="text-[0.62rem] font-semibold text-navy-900">#1042 · Where is my order?</p>
            <span className="rounded bg-success-50 px-1.5 text-[0.55rem] font-semibold text-success-700">Open</span>
          </div>
          <div className="rounded-lg bg-paper p-2 ring-1 ring-line">
            <p className="flex items-center gap-1 text-[0.58rem] font-semibold text-navy-900">
              <Package className="size-3 text-emerald-700" /> Shopify order #5531
            </p>
            <p className="mt-1 flex items-center gap-1 text-[0.55rem] text-slate-600">
              <Truck className="size-3" /> Shipped Oct 28 · arriving Nov 1
            </p>
          </div>
          <div className="rounded-lg bg-violet-50 p-2 ring-1 ring-violet-100">
            <p className="flex items-center gap-1 text-[0.58rem] font-semibold text-violet-800">
              <Sparkles className="size-3" /> Suggested reply
            </p>
            <p className="mt-1 text-[0.55rem] leading-relaxed text-slate-700">
              Hi Sam — your order shipped on Oct 28 and is due on Nov 1. Here&apos;s your tracking link…
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-white">
                <span className="block h-full w-[92%] rounded-full bg-cobalt-600" />
              </span>
              <span className="text-[0.5rem] font-semibold text-slate-700">92%</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="flex-1 rounded-md py-1 text-center text-[0.55rem] font-semibold text-navy-900 ring-1 ring-line">Edit</span>
            <span className="flex-1 rounded-md bg-cobalt-600 py-1 text-center text-[0.55rem] font-semibold text-white">Approve & send</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── FieldOps AI: dispatch board ─────────────────────────────────────────────── */

// [technician, jobs: [start hour offset from 8, length in hours, label, tone]]
const crew: [string, [number, number, string, string][]][] = [
  ["Maria G.", [[0, 2, "AC repair", "bg-emerald-100 border-emerald-600"], [2.5, 2, "Install", "bg-cobalt-100 border-cobalt-600"], [5, 2, "Inspection", "bg-amber-100 border-amber-600"]]],
  ["Daniel K.", [[0.5, 1.5, "Inspection", "bg-amber-100 border-amber-600"], [3, 3, "Boiler service", "bg-emerald-100 border-emerald-600"]]],
  ["Aisha R.", [[1, 2, "Install", "bg-cobalt-100 border-cobalt-600"], [4, 1, "Break", "bg-slate-100 border-slate-400"], [5.5, 1.5, "Repair", "bg-emerald-100 border-emerald-600"]]],
  ["Tom B.", [[0, 3, "Panel upgrade", "bg-cobalt-100 border-cobalt-600"], [4, 2.5, "AC repair", "bg-emerald-100 border-emerald-600"]]],
  ["Lena S.", [[2, 2, "Maintenance", "bg-amber-100 border-amber-600"], [4.5, 2, "Install", "bg-cobalt-100 border-cobalt-600"]]],
];
const hours = ["8", "9", "10", "11", "12", "1", "2", "3"];

function FieldOpsPreview() {
  return (
    <Frame title="FieldOps AI — Dispatch">
      <div className="flex">
        <Rail icons={[Home, CalendarDays, Wrench, Users, CreditCard, Settings]} active={1} />
        <div className="min-w-0 flex-1 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-navy-900">Dispatch</p>
              <span className="rounded-md px-1.5 py-0.5 text-[0.6rem] text-slate-600 ring-1 ring-line">Today</span>
            </div>
            <span className="flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[0.6rem] font-semibold text-white">
              <Sparkles className="size-3" /> Auto-schedule
            </span>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg ring-1 ring-line">
            <div className="flex border-b border-line bg-paper text-[0.55rem] text-slate-500">
              <span className="w-16 shrink-0 px-2 py-1 @lg:w-20">Team</span>
              <div className="grid flex-1 grid-cols-8">
                {hours.map((h) => (
                  <span key={h} className="border-l border-line px-1 py-1">
                    {h}
                  </span>
                ))}
              </div>
            </div>
            {crew.map(([name, jobs]) => (
              <div key={name} className="flex border-b border-line last:border-b-0">
                <span className="flex w-16 shrink-0 items-center gap-1 px-2 py-2 @lg:w-20">
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[0.45rem] font-semibold text-white">
                    {initials(name)}
                  </span>
                  <span className="truncate text-[0.55rem] font-medium text-navy-900">{name}</span>
                </span>
                <div className="relative flex-1">
                  {jobs.map(([start, len, label, tone]) => (
                    <span
                      key={`${start}-${label}`}
                      className={cn("absolute top-1 bottom-1 truncate rounded border-l-2 px-1 text-[0.5rem] leading-[1.6] font-medium text-navy-900", tone)}
                      style={{ left: `${(start / 8) * 100}%`, width: `${(len / 8) * 100 - 1}%` }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 hidden items-center gap-2 rounded-lg bg-violet-50 p-2 text-[0.58rem] text-slate-700 ring-1 ring-violet-100 @xl:flex">
            <Sparkles className="size-3 shrink-0 text-violet-700" />
            <span>
              <span className="font-semibold text-violet-800">Suggestion:</span> assign the 2 pm water-heater install to Lena S. — closest
              technician with the right certification.
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

const previews = { clientflow: ClientFlowPreview, commercepilot: CommercePilotPreview, fieldops: FieldOpsPreview };

/**
 * Real screenshots when the product has them; otherwise the design preview, captioned so nobody mistakes it for the
 * running product.
 */
export function ProductPreview({ product, className, caption = true }: { product: Product; className?: string; caption?: boolean }) {
  const shot = product.screenshots[0];
  if (shot) {
    return (
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        className={cn("h-auto w-full rounded-2xl shadow-card ring-1 ring-line", className)}
      />
    );
  }
  const Preview = previews[product.preview];
  return (
    <figure className={className}>
      <div aria-hidden="true">
        <Preview />
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-slate-600">
          Design preview of {product.name}
          {isReleased(product) ? "" : " — the product is in development"}. Sample data is fictional.
        </figcaption>
      )}
    </figure>
  );
}
