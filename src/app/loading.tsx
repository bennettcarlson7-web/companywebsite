import { Container } from "@/components/ui/primitives";

/** Lightweight skeleton shown during navigations to segments that are still rendering. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="bg-gradient-to-b from-mist to-white">
      <span className="sr-only">Loading…</span>
      <Container className="animate-pulse py-16 sm:py-20">
        <div className="h-3 w-40 rounded-full bg-cobalt-100" />
        <div className="mt-8 h-10 w-full max-w-xl rounded-xl bg-line" />
        <div className="mt-4 h-10 w-full max-w-md rounded-xl bg-line" />
        <div className="mt-8 h-4 w-full max-w-2xl rounded-full bg-line/70" />
        <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-line/70" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white ring-1 ring-line" />
          ))}
        </div>
      </Container>
    </div>
  );
}
