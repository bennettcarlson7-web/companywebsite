import {
  Code2,
  Compass,
  Gauge,
  Layers,
  LayoutDashboard,
  MessagesSquare,
  PenTool,
  Plug,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/types/content";

const icons: Record<IconName, LucideIcon> = {
  code: Code2,
  smartphone: Smartphone,
  sparkles: Sparkles,
  plug: Plug,
  users: Users,
  layout: LayoutDashboard,
  compass: Compass,
  pen: PenTool,
  rocket: Rocket,
  trending: TrendingUp,
  shield: ShieldCheck,
  message: MessagesSquare,
  layers: Layers,
  gauge: Gauge,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Component = icons[name];
  return <Component aria-hidden="true" className={className} strokeWidth={1.75} />;
}

/** Rounded pale-blue tile holding an icon, used across cards. */
export function IconTile({ name, className }: { name: IconName; className?: string }) {
  return (
    <span
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-cobalt-50 text-cobalt-600 ring-1 ring-cobalt-100 ring-inset ${className ?? ""}`}
    >
      <Icon name={name} className="size-5" />
    </span>
  );
}
