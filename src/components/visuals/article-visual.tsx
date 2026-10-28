import { Bot, Handshake, Lightbulb, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const byCategory: Record<string, { icon: LucideIcon; gradient: string }> = {
  "Product Strategy": { icon: Lightbulb, gradient: "from-cobalt-600 via-cobalt-500 to-cobalt-300" },
  "AI & Automation": { icon: Bot, gradient: "from-navy-900 via-navy-800 to-cobalt-700" },
  "Working With Partners": { icon: Handshake, gradient: "from-cobalt-800 via-cobalt-700 to-cobalt-400" },
};

export function ArticleVisual({ category, className }: { category: string; className?: string }) {
  const { icon: Icon, gradient } = byCategory[category] ?? byCategory["Product Strategy"]!;
  return (
    <div aria-hidden="true" className={cn("relative aspect-[16/9] overflow-hidden bg-gradient-to-br", gradient, className)}>
      <div className="bg-grid absolute inset-0 opacity-40 mix-blend-overlay" />
      <svg viewBox="0 0 400 225" className="absolute inset-0 size-full opacity-25" preserveAspectRatio="none">
        <circle cx="330" cy="40" r="90" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="330" cy="40" r="140" fill="none" stroke="white" strokeWidth="1" />
        <path d="M0 180 C 100 140, 180 220, 400 150" fill="none" stroke="white" strokeWidth="1.2" />
      </svg>
      <span className="absolute bottom-5 left-5 inline-flex size-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
        <Icon className="size-7 text-white" strokeWidth={1.6} />
      </span>
    </div>
  );
}
