import { readIntakeEnv } from "@/lib/integrations/env";
import { createRateLimiter } from "@/lib/integrations/rate-limit";
import { handleInquiry } from "@/lib/integrations/handle-inquiry";
import { jsonResponse, readSubmission } from "@/lib/integrations/http";

/** Customer project inquiries. Candidate applications use /api/apply. */
export async function POST(request: Request) {
  const submission = await readSubmission(request);
  if (!submission) return jsonResponse({ status: "rejected" }, 413);

  const env = readIntakeEnv();
  const result = await handleInquiry(submission, { env, limiter: createRateLimiter(env) });
  return jsonResponse(result.body, result.httpStatus, result.headers);
}
