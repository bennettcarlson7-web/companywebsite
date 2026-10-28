import { Bot, CalendarDays, CircleCheck, FileText, Search } from "lucide-react";
import type { ProjectVisualVariant } from "@/types/content";
import { cn } from "@/lib/utils";

/** Original, decorative UI illustrations for concept projects (no screenshots of client work). */
export function ProjectVisual({ variant, className }: { variant: ProjectVisualVariant; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative aspect-[16/10] overflow-hidden select-none", className)}>
      {variant === "dashboard" && <Dashboard />}
      {variant === "booking" && <Booking />}
      {variant === "assistant" && <Assistant />}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950 p-[6%]">
      <div className="bg-grid absolute inset-0 opacity-30" />
      <div className="relative h-full rounded-xl bg-navy-900/80 p-[5%] ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <span className="h-2 w-1/4 rounded-full bg-white/70" />
          <span className="h-4 w-12 rounded-full bg-cobalt-500/90" />
        </div>
        <div className="mt-[5%] grid grid-cols-3 gap-[4%]">
          {["bg-cobalt-400", "bg-[#3ccf8e]", "bg-[#ffc24b]"].map((c) => (
            <div key={c} className="rounded-lg bg-white/5 p-2 ring-1 ring-white/10">
              <span className="block h-1.5 w-1/2 rounded-full bg-white/30" />
              <span className={cn("mt-2 block h-2.5 w-3/4 rounded-full", c)} />
            </div>
          ))}
        </div>
        <div className="mt-[5%] flex h-[42%] items-end gap-[2.5%]">
          {[30, 48, 40, 62, 55, 72, 66, 84, 78, 92].map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} className={cn("flex-1 rounded-t", i > 6 ? "bg-cobalt-400" : "bg-cobalt-400/40")} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Booking() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-cobalt-50 via-white to-cobalt-100">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute top-[12%] left-[22%] w-[26%] rotate-[-6deg] rounded-[1.2rem] bg-navy-900 p-1 shadow-card">
        <div className="rounded-[1rem] bg-white p-2">
          <span className="block h-1.5 w-1/2 rounded-full bg-navy-900/70" />
          <div className="mt-2 grid grid-cols-4 gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={cn("aspect-square rounded", i === 6 ? "bg-cobalt-600" : "bg-paper ring-1 ring-line")} />
            ))}
          </div>
          <span className="mt-2 block h-4 rounded-md bg-cobalt-600" />
        </div>
      </div>
      <div className="absolute top-[18%] right-[20%] w-[28%] rotate-[5deg] rounded-[1.2rem] bg-navy-900 p-1 shadow-float">
        <div className="rounded-[1rem] bg-white p-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-cobalt-600" />
            <span className="h-1.5 w-1/2 rounded-full bg-navy-900/70" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="mt-2 flex items-center gap-1.5 rounded-md bg-paper p-1.5 ring-1 ring-line">
              <span className={cn("size-4 rounded", i === 0 ? "bg-cobalt-200" : "bg-line")} />
              <span className="h-1.5 flex-1 rounded-full bg-line" />
            </div>
          ))}
          <div className="mt-2 flex items-center gap-1 rounded-md bg-success-50 p-1.5">
            <CircleCheck className="size-3 text-success-700" />
            <span className="h-1.5 w-2/3 rounded-full bg-success-700/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Assistant() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-[#0b2a6b] p-[6%]">
      <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-cobalt-500/30 blur-3xl" />
      <div className="relative flex h-full flex-col rounded-xl bg-white/[0.04] p-[5%] ring-1 ring-white/10">
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5">
          <Search className="size-3.5 text-white/70" />
          <span className="h-1.5 w-1/2 rounded-full bg-white/40" />
        </div>
        <div className="mt-[5%] ml-auto w-3/5 rounded-xl rounded-tr-sm bg-cobalt-600 p-2">
          <span className="block h-1.5 w-full rounded-full bg-white/80" />
          <span className="mt-1 block h-1.5 w-2/3 rounded-full bg-white/60" />
        </div>
        <div className="mt-[4%] flex w-4/5 gap-2">
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Bot className="size-3.5 text-cobalt-300" />
          </span>
          <div className="flex-1 rounded-xl rounded-tl-sm bg-white/10 p-2">
            <span className="block h-1.5 w-full rounded-full bg-white/60" />
            <span className="mt-1 block h-1.5 w-5/6 rounded-full bg-white/40" />
            <span className="mt-1 block h-1.5 w-3/5 rounded-full bg-white/40" />
            <div className="mt-2 flex gap-1.5">
              {[0, 1].map((i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5">
                  <FileText className="size-2.5 text-cobalt-300" />
                  <span className="h-1 w-6 rounded-full bg-white/40" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
