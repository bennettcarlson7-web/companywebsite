import { readInquiryEnv } from "@/lib/integrations/env";
import { createRateLimiter } from "@/lib/integrations/rate-limit";
import { handleInquiry } from "@/lib/integrations/handle-inquiry";
import { LIMITS } from "@/lib/validation/inquiry";

/**
 * Client IP for rate limiting. Behind Vercel/most proxies the first X-Forwarded-For entry is the
 * client; only trust this header when the app runs behind a proxy that sets it.
 */
function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > LIMITS.bodyBytes) {
    return Response.json({ status: "rejected" }, { status: 413 });
  }

  const env = readInquiryEnv();
  const result = await handleInquiry(
    {
      rawBody: await request.text(),
      contentType: request.headers.get("content-type"),
      ip: clientIp(request.headers),
      origin: request.headers.get("origin"),
      host: request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    },
    { env, limiter: createRateLimiter(env) },
  );

  return Response.json(result.body, {
    status: result.httpStatus,
    headers: { "Cache-Control": "no-store", ...result.headers },
  });
}
