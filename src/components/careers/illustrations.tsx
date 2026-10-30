import { BarChart3, Globe, Mic, PhoneOff, UserRound, Users, Video, type LucideIcon } from "lucide-react";
import { getTeam, initialsOf } from "@/content/team";
import { cn } from "@/lib/utils";

/**
 * Decorative careers illustrations, drawn in code. They deliberately show no faces: the page never presents stock
 * people as our team. Real, approved photos belong in src/content/team.ts.
 */

// Syntax-highlighted lines for the editor window: [indent, [text, color][]].
const code: [number, [string, string][]][] = [
  [0, [["export async function ", "text-violet-300"], ["ship", "text-sky-300"], ["(idea: ", "text-slate-300"], ["Idea", "text-emerald-300"], [") {", "text-slate-300"]]],
  [1, [["const ", "text-violet-300"], ["plan ", "text-slate-100"], ["= await ", "text-violet-300"], ["scope", "text-sky-300"], ["(idea);", "text-slate-300"]]],
  [1, [["const ", "text-violet-300"], ["build ", "text-slate-100"], ["= await ", "text-violet-300"], ["engineer", "text-sky-300"], ["(plan, {", "text-slate-300"]]],
  [2, [["tests", "text-slate-100"], [": ", "text-slate-300"], ["true", "text-amber-300"], [",", "text-slate-300"]]],
  [2, [["reviewed", "text-slate-100"], [": ", "text-slate-300"], ["true", "text-amber-300"], [",", "text-slate-300"]]],
  [1, [["});", "text-slate-300"]]],
  [1, [["// measure, learn, improve", "text-slate-500"]]],
  [1, [["return ", "text-violet-300"], ["deploy", "text-sky-300"], ["(build);", "text-slate-300"]]],
  [0, [["}", "text-slate-300"]]],
];

function Chip({ Icon, top, bottom, className }: { Icon: LucideIcon; top: string; bottom: string; className: string }) {
  return (
    <div className={cn("absolute flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 shadow-float ring-1 ring-line sm:gap-3 sm:px-3.5 sm:py-2.5", className)}>
      <span className="inline-flex size-7 items-center justify-center rounded-lg bg-cobalt-50 text-cobalt-600 sm:size-8">
        <Icon className="size-4" />
      </span>
      <p className="text-[0.7rem] leading-tight sm:text-xs">
        <span className="block font-semibold text-navy-900">{top}</span>
        <span className="text-slate-600">{bottom}</span>
      </p>
    </div>
  );
}

function WindowDots() {
  return (
    <span className="flex gap-1">
      <span className="size-2 rounded-full bg-rose-400/80" />
      <span className="size-2 rounded-full bg-amber-400/80" />
      <span className="size-2 rounded-full bg-emerald-400/80" />
    </span>
  );
}

/**
 * Hero: the work itself — a code editor and a release dashboard on the brand's navy, with three highlights.
 * The "online" avatars use the real team's initials.
 */
export function CareersHeroVisual() {
  const online = getTeam().slice(0, 4);
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-cobalt-800 shadow-card ring-1 ring-navy-700"
    >
      {/* Grid texture and glow */}
      <div className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute -top-1/4 -right-1/4 size-3/4 rounded-full bg-cobalt-500/30 blur-3xl" />

      {/* Code editor */}
      <div className="absolute top-[12%] left-[6%] w-[70%] overflow-hidden rounded-xl bg-navy-950/95 shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
          <WindowDots />
          <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[0.6rem] text-slate-300">ship.ts</span>
        </div>
        <pre className="overflow-hidden px-3 py-3 font-mono text-[0.55rem] leading-[1.7] sm:text-[0.68rem]">
          {code.map(([indent, tokens], i) => (
            <div key={i} className="flex whitespace-pre">
              <span className="mr-3 w-3 shrink-0 text-right text-slate-600 select-none">{i + 1}</span>
              <span style={{ paddingLeft: `${indent * 1.2}em` }}>
                {tokens.map(([t, color], j) => (
                  <span key={j} className={color}>
                    {t}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </pre>
      </div>

      {/* Release dashboard */}
      <div className="absolute right-[5%] bottom-[9%] w-[52%] rounded-xl bg-white p-3 shadow-2xl ring-1 ring-line sm:p-4">
        <div className="flex items-center justify-between">
          <p className="text-[0.65rem] font-semibold text-navy-900 sm:text-xs">Release</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[0.6rem] font-semibold text-success-700">
            <span className="size-1.5 rounded-full bg-success-700" />
            Live
          </span>
        </div>
        <svg viewBox="0 0 200 60" className="mt-2 h-auto w-full">
          <defs>
            <linearGradient id="careers-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1256ed" stopOpacity="0.25" />
              <stop offset="1" stopColor="#1256ed" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 50 L25 44 L50 46 L75 34 L100 37 L125 24 L150 27 L175 14 L200 8 L200 60 L0 60Z" fill="url(#careers-area)" />
          <path d="M0 50 L25 44 L50 46 L75 34 L100 37 L125 24 L150 27 L175 14 L200 8" fill="none" stroke="#1256ed" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-2 text-[0.6rem] sm:text-[0.68rem]">
          <p className="text-slate-600">
            Tests <span className="block font-semibold text-navy-900">All passing</span>
          </p>
          <p className="text-slate-600">
            Review <span className="block font-semibold text-navy-900">Approved</span>
          </p>
        </div>
      </div>

      {/* Team online */}
      <div className="absolute bottom-[9%] left-[6%] hidden items-center gap-2 rounded-full bg-white/10 py-1.5 pr-3 pl-1.5 ring-1 ring-white/15 backdrop-blur sm:flex">
        <span className="flex -space-x-1">
          {online.map((m, i) => (
            <span
              key={m.name}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-full text-[0.55rem] font-semibold text-white ring-2 ring-navy-800",
                ["bg-cobalt-600", "bg-emerald-700", "bg-violet-700", "bg-amber-700"][i],
              )}
            >
              {initialsOf(m.name)}
            </span>
          ))}
        </span>
        <span className="text-[0.65rem] font-medium text-white">Team online</span>
      </div>

      <Chip Icon={Globe} top="Work" bottom="From Anywhere" className="top-[5%] right-[5%]" />
      <Chip Icon={BarChart3} top="Build" bottom="Real Products" className="top-[2%] left-[4%] hidden xs:flex" />
      <Chip Icon={Users} top="Grow" bottom="Your Career" className="top-[58%] left-[3%]" />
    </div>
  );
}

const tileTones = ["from-cobalt-500 to-cobalt-700", "from-emerald-500 to-emerald-700", "from-amber-500 to-amber-700", "from-violet-500 to-violet-700"];

/** How we work: a remote team call. Placeholder silhouettes, not real people. */
export function RemoteCallVisual() {
  return (
    <div aria-hidden="true" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-950 p-6 ring-1 ring-navy-700 shadow-card sm:p-8">
      <div className="mx-auto max-w-sm rounded-xl border-4 border-navy-700 bg-navy-950 p-2">
        <div className="grid grid-cols-2 gap-2">
          {tileTones.map((tone) => (
            <div key={tone} className="relative flex aspect-video items-center justify-center rounded-lg bg-navy-800">
              <span className={cn("inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-white", tone)}>
                <UserRound className="size-5" />
              </span>
              <span className="absolute bottom-1.5 left-1.5 h-1.5 w-8 rounded-full bg-white/30" />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-2">
          {[Mic, Video].map((Icon, i) => (
            <span key={i} className="inline-flex size-7 items-center justify-center rounded-full bg-navy-700 text-white">
              <Icon className="size-3.5" />
            </span>
          ))}
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-danger-600 text-white">
            <PhoneOff className="size-3.5" />
          </span>
        </div>
      </div>
      <div className="mx-auto h-2 max-w-[24rem] rounded-b-xl bg-gradient-to-b from-slate-500 to-slate-600" />
    </div>
  );
}
