import type { ReactNode } from "react";
import { BarChart3, CalendarCheck, Cloud, MousePointer2, Sparkles } from "lucide-react";

/**
 * Original illustration for the hero: a product canvas being shaped together, with
 * collaboration cursors ("You" and the studio) rather than stock photography of people.
 * Purely decorative — the hero text carries the meaning.
 */
export function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-xl select-none lg:max-w-none">
      <div className="relative aspect-[5/4.4] overflow-hidden rounded-[2rem] bg-gradient-to-br from-cobalt-100 via-cobalt-50 to-white ring-1 ring-cobalt-100">
        <div className="bg-grid absolute inset-0 opacity-70" />
        <div className="absolute -top-24 -right-20 size-72 rounded-full bg-cobalt-300/30 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 size-72 rounded-full bg-cobalt-200/50 blur-3xl" />

        {/* Browser window */}
        <div className="absolute top-[11%] right-[7%] left-[7%] rounded-2xl bg-white shadow-card ring-1 ring-line">
          <div className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5">
            <span className="size-2 rounded-full bg-[#ff6b6b]/80" />
            <span className="size-2 rounded-full bg-[#ffc24b]/80" />
            <span className="size-2 rounded-full bg-[#3ccf8e]/80" />
            <span className="ml-3 h-4 w-36 rounded-full bg-paper text-[0.5rem] leading-4 text-slate-500 ring-1 ring-line sm:w-44">
              <span className="pl-2">app.yourproduct.com</span>
            </span>
          </div>
          <div className="grid grid-cols-[18%_1fr] gap-3 p-3.5">
            <div className="space-y-2 pt-1">
              <span className="block h-2 w-4/5 rounded-full bg-cobalt-600/80" />
              <span className="block h-2 w-3/5 rounded-full bg-line" />
              <span className="block h-2 w-4/5 rounded-full bg-line" />
              <span className="block h-2 w-2/3 rounded-full bg-line" />
              <span className="block h-2 w-3/4 rounded-full bg-line" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-semibold text-navy-900 sm:text-xs">Product roadmap</span>
                <span className="rounded-full bg-success-50 px-2 py-0.5 text-[0.55rem] font-medium text-success-700">On track</span>
              </div>
              <div className="mt-3 flex h-20 items-end gap-1.5 sm:h-24">
                {[38, 52, 46, 64, 58, 78, 92].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-t-md ${i === 6 ? "bg-cobalt-600" : i >= 4 ? "bg-cobalt-400" : "bg-cobalt-200"}`}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["Discover", "Build", "Launch"].map((col, i) => (
                  <div key={col} className="rounded-lg bg-paper p-2 ring-1 ring-line">
                    <span className="text-[0.5rem] font-semibold tracking-wide text-slate-600 uppercase sm:text-[0.55rem]">{col}</span>
                    <span className="mt-1.5 block h-5 rounded-md bg-white ring-1 ring-line" />
                    {i < 2 && <span className="mt-1 block h-5 rounded-md bg-white ring-1 ring-line" />}
                    {i === 1 && <span className="mt-1 block h-5 rounded-md bg-cobalt-50 ring-1 ring-cobalt-200" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration cursors */}
        <div className="absolute top-[45%] left-[30%] flex items-start gap-1">
          <MousePointer2 className="size-4 fill-navy-900 text-navy-900" />
          <span className="mt-3 rounded-md bg-navy-900 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">You</span>
        </div>
        <div className="absolute top-[30%] right-[22%] flex items-start gap-1">
          <MousePointer2 className="size-4 fill-cobalt-600 text-cobalt-600" />
          <span className="mt-3 rounded-md bg-cobalt-600 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">Nextmade</span>
        </div>

        {/* Phone */}
        <div className="absolute right-[5%] bottom-[5%] w-[30%] rounded-[1.4rem] bg-navy-900 p-1.5 shadow-float">
          <div className="rounded-[1.1rem] bg-white p-2.5">
            <span className="mx-auto block h-1 w-8 rounded-full bg-line" />
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-success-50 text-success-700">
                <CalendarCheck className="size-3" />
              </span>
              <span className="text-[0.5rem] font-semibold text-navy-900 sm:text-[0.6rem]">Booking confirmed</span>
            </div>
            <div className="mt-2 space-y-1.5">
              <span className="block h-1.5 w-full rounded-full bg-line" />
              <span className="block h-1.5 w-4/5 rounded-full bg-line" />
            </div>
            <span className="mt-2.5 block rounded-md bg-cobalt-600 py-1 text-center text-[0.5rem] font-semibold text-white">
              View details
            </span>
          </div>
        </div>
      </div>

      {/* Floating feature cards */}
      <FloatCard className="-top-4 right-2 sm:-right-4 lg:-right-6" delay="0s" icon={<BarChart3 className="size-4" />} title="Ideas to Products" body="Strategy · Design · Development" />
      <FloatCard className="top-[54%] -left-3 hidden sm:flex lg:-left-10" delay="1.2s" icon={<Cloud className="size-4" />} title="Scalable technology" body="Built for what's next" />
      <FloatCard className="-bottom-5 left-[8%]" delay="2.4s" icon={<Sparkles className="size-4" />} title="Practical AI" body="With people in the loop" />
    </div>
  );
}

function FloatCard({
  className,
  icon,
  title,
  body,
  delay,
}: {
  className: string;
  icon: ReactNode;
  title: string;
  body: string;
  delay: string;
}) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={`absolute flex animate-float items-center gap-3 rounded-2xl bg-white/95 px-3.5 py-3 shadow-float ring-1 ring-line backdrop-blur ${className}`}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-cobalt-50 text-cobalt-600">{icon}</span>
      <span>
        <span className="block text-xs font-semibold text-navy-900 sm:text-sm">{title}</span>
        <span className="block text-[0.7rem] text-slate-600 sm:text-xs">{body}</span>
      </span>
    </div>
  );
}
