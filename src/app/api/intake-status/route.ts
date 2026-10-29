import { connection } from "next/server";
import { isEmailConfigured, readIntakeEnv } from "@/lib/integrations/env";
import { createSubmissionStore } from "@/lib/integrations/submission-store";

/**
 * Read-only setup check for the owner: is there somewhere to put form submissions?
 * Reports only which kind of provider is configured — never URLs, addresses, keys, or counts.
 * `ready: false` means the forms will show the "couldn't send" fallback.
 */
export async function GET() {
  await connection(); // evaluate per request, never at build time
  const env = readIntakeEnv();
  const storage = createSubmissionStore(env)?.name ?? "none";
  const email = !isEmailConfigured(env) ? "none" : env.resendApiKey ? "resend" : "smtp";
  return Response.json(
    { ready: storage !== "none" || email !== "none", storage, email },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
