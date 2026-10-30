import { getAdminSession } from "@/lib/admin/session";
import { getCandidate } from "@/lib/data/candidates";
import { createRedis } from "@/lib/data/redis";
import { readIntakeEnv } from "@/lib/integrations/env";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** Downloads a candidate's résumé. Admins only; always as an attachment, never rendered inline. */
export async function GET(_req: Request, { params }: RouteContext<"/admin/candidates/[id]/resume">) {
  if (!(await getAdminSession())) return new Response("Not found", { status: 404 });
  const { id } = await params;
  const redis = createRedis(readIntakeEnv());
  const c = redis ? await getCandidate(redis, id) : null;
  const resume = c?.data.resume as { filename?: string; contentType?: string; data?: string } | undefined;
  if (!resume?.data || !resume.filename) return new Response("Not found", { status: 404 });

  const body = Buffer.from(resume.data, "base64");
  const type = resume.contentType && ALLOWED_TYPES.has(resume.contentType) ? resume.contentType : "application/octet-stream";
  const ascii = resume.filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(body.length),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(resume.filename)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
