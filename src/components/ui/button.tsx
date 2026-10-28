import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out-soft disabled:pointer-events-none disabled:opacity-60 active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-cobalt-600 text-white shadow-cta hover:bg-cobalt-700",
  secondary: "border border-cobalt-200 bg-white text-navy-900 hover:border-cobalt-400 hover:bg-cobalt-50",
  ghost: "text-cobalt-700 hover:bg-cobalt-50",
  inverse: "bg-white text-navy-900 hover:bg-cobalt-50",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-[0.95rem]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

function Arrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
    />
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ variant, size, arrow, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** For external URLs and mailto: links, where next/link isn't appropriate. */
export function ButtonAnchor({
  variant,
  size,
  arrow,
  className,
  children,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; size?: Size; arrow?: boolean }) {
  return (
    <a className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </a>
  );
}

export function TextLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-700 hover:text-cobalt-800",
        className,
      )}
      {...props}
    >
      {children}
      <Arrow />
    </Link>
  );
}
