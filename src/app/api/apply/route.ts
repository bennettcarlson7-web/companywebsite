import { readIntakeEnv } from "@/lib/integrations/env";
import { createRateLimiter } from "@/lib/integrations/rate-limit";
import { handleApplication } from "@/lib/integrations/handle-application";
import { jsonResponse, readSubmission } from "@/lib/integrations/http";
import { createSubmissionStore } from "@/lib/integrations/submission-store";
import { SUBMISSION_LIMITS } from "@/lib/validation/shared";

/** Candidate job applications. Kept separate from /api/inquiry: own schema, handler, inbox, and rate-limit bucket. */
export async function POST(request: Request) {
  const submission = await readSubmission(request, SUBMISSION_LIMITS.applicationBodyBytes);
  if (!submission) return jsonResponse({ status: "rejected" }, 413);

  const env = readIntakeEnv();
  const result = await handleApplication(submission, { env, limiter: createRateLimiter(env), store: createSubmissionStore(env) });
  return jsonResponse(result.body, result.httpStatus, result.headers);
}
