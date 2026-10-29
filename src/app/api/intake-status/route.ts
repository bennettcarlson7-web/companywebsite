import { connection } from "next/server";
import { isEmailConfigured, readIntakeEnv } from "@/lib/integrations/env";
import { createSubmissionStore } from "@/lib/integrations/submission-store";

/**
 * Read-only setup check for the owner: is there somewhere to put form submissions, and which deployment is this?
 * Reports only provider kinds and Vercel's public deployment metadata — never URLs, addresses, keys, or counts.
 * `ready: false` means the forms will show the "couldn't send" fallback.
 */
export async function GET() {
  await connection(); // evaluate per request, never at build time
  const env = readIntakeEnv();
  const storage = createSubmissionStore(env)?.name ?? "none";
  const email = !isEmailConfigured(env) ? "none" : env.resendApiKey ? "resend" : "smtp";
  return Response.json(
    {
      ready: storage !== "none" || email !== "none",
      storage,
      email,
      deployment: {
        environment: process.env.VERCEL_ENV ?? "local",
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
        branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      },
    },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
