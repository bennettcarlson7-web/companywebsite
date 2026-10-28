"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fades content in as it scrolls into view.
 * Server-rendered content is fully visible. After hydration, only elements that start below
 * the fold are hidden and then revealed, so nothing above the fold flashes and no-JS visitors
 * see everything. Respects prefers-reduced-motion via CSS (see globals.css).
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.dataset.reveal = "shown";
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
