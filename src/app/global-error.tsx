"use client";

import "@/styles/globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en-US">
      <body className="flex min-h-dvh items-center justify-center bg-white p-6 font-sans text-navy-900">
        <title>Something went wrong</title>
        <main className="max-w-md text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-slate-600">An unexpected error occurred while loading the site. Please try again.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-cobalt-600 px-6 font-semibold text-white hover:bg-cobalt-700"
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}
