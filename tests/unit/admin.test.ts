import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalRedis } from "@/lib/data/redis";
import { isAdminEmail, isAdminEnabled, readAdminConfig } from "@/lib/admin/config";
import { signSession, verifySession, SESSION_TTL_SECONDS } from "@/lib/admin/session";
import { requestLoginCode, verifyLoginCode } from "@/lib/admin/login-codes";
import { deleteCandidate, getCandidate, listCandidates, saveReview, statusOf } from "@/lib/data/candidates";
import { readJobs, seedManagedJobs, writeJobs } from "@/lib/data/jobs";
import { RedisSubmissionStore, submissionKeys } from "@/lib/integrations/submission-store";
import { readIntakeEnv } from "@/lib/integrations/env";
import type { SmtpSender } from "@/lib/integrations/email";
import { jobPostingSchema, slugify, uniqueSlug } from "@/lib/validation/job-posting";

let dir: string | undefined;
afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("LocalRedis (the local stand-in for Upstash)", () => {
  it("supports the commands the app uses, including expiry and sorted sets", async () => {
    let now = 1_000_000;
    const r = new LocalRedis(undefined, () => now);
    await r.exec([["SET", "a", "1", "EX", 10], ["ZADD", "z", 2, "b"], ["ZADD", "z", 1, "a"], ["ZADD", "z", 3, "c"]]);
    expect(await r.exec([["GET", "a"], ["ZRANGE", "z", 0, -1, "REV"], ["ZRANGE", "z", 0, 1], ["TTL", "a"]])).toEqual(["1", ["c", "b", "a"], ["a", "b"], 10]);
    expect(await r.exec([["INCR", "n"], ["EXPIRE", "n", 5, "NX"], ["INCR", "n"], ["EXPIRE", "n", 99, "NX"], ["TTL", "n"]])).toEqual([1, 1, 2, 0, 5]);
    now += 11_000;
    expect(await r.exec([["GET", "a"], ["GET", "n"], ["MGET", "a", "missing"]])).toEqual([null, null, [null, null]]);
    expect(await r.exec([["ZREM", "z", "b"], ["ZCARD", "z"], ["DEL", "z"], ["ZCARD", "z"]])).toEqual([1, 2, 1, 0]);
  });

  it("persists to its file so another process (or a restart) sees the same data", async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "nm-redis-"));
    const file = path.join(dir, "local-redis.json");
    await new LocalRedis(file).exec([["SET", "k", "v"]]);
    expect(await new LocalRedis(file).exec([["GET", "k"]])).toEqual(["v"]);
  });
});

describe("admin configuration", () => {
  const secret = "s".repeat(40);
  it("uses ADMIN_EMAILS, or falls back to the hiring inbox", () => {
    expect(readAdminConfig({ ADMIN_EMAILS: "A@x.com, b@y.org", HIRING_EMAIL: "h@z.com" }).emails).toEqual(["a@x.com", "b@y.org"]);
    expect(readAdminConfig({ HIRING_EMAIL: "Hiring@Z.com" }).emails).toEqual(["hiring@z.com"]);
    expect(isAdminEmail(" HIRING@z.com ", readAdminConfig({ HIRING_EMAIL: "hiring@z.com" }))).toBe(true);
  });

  it("needs a strong secret or Upstash; otherwise the admin area stays off", () => {
    expect(isAdminEnabled(readAdminConfig({ HIRING_EMAIL: "h@z.com" }))).toBe(false);
    expect(isAdminEnabled(readAdminConfig({ HIRING_EMAIL: "h@z.com", ADMIN_SESSION_SECRET: "short" }))).toBe(false);
    expect(isAdminEnabled(readAdminConfig({ HIRING_EMAIL: "h@z.com", ADMIN_SESSION_SECRET: secret }))).toBe(true);
    expect(isAdminEnabled(readAdminConfig({ HIRING_EMAIL: "h@z.com", KV_REST_API_TOKEN: "tok" }))).toBe(true);
    expect(isAdminEnabled(readAdminConfig({ ADMIN_SESSION_SECRET: secret }))).toBe(false);
  });
});

describe("admin sessions", () => {
  const key = Buffer.alloc(32, 7);
  it("round-trips a signed session and rejects tampering, other keys, and expiry", () => {
    const now = Date.now();
    const token = signSession("admin@x.com", key, now);
    expect(verifySession(token, key, now)).toMatchObject({ email: "admin@x.com" });
    const [payload, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ e: "evil@x.com", x: now + 1e9, n: "a" })).toString("base64url");
    expect(verifySession(`${forged}.${sig}`, key, now)).toBeNull();
    expect(verifySession(`${payload}.${sig}x`, key, now)).toBeNull();
    expect(verifySession(token, Buffer.alloc(32, 8), now)).toBeNull();
    expect(verifySession(token, key, now + SESSION_TTL_SECONDS * 1000 + 1)).toBeNull();
    expect(verifySession(undefined, key)).toBeNull();
  });
});

describe("emailed sign-in codes", () => {
  const config = readAdminConfig({ ADMIN_EMAILS: "admin@nextmade.test", ADMIN_SESSION_SECRET: "k".repeat(40) });
  const env = readIntakeEnv({ SMTP_HOST: "smtp.test", SMTP_USER: "bot@nextmade.test", SMTP_PASSWORD: "pw" });
  const codeFrom = (send: ReturnType<typeof vi.fn<SmtpSender>>) => /\b(\d{6})\b/.exec(send.mock.calls.at(-1)![0].text)![1]!;

  it("emails a 6-digit code to an admin, which signs in once", async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "nm-login-"));
    const file = path.join(dir, "local-redis.json");
    const redis = new LocalRedis(file);
    const send = vi.fn<SmtpSender>(async () => {});
    expect(await requestLoginCode("Admin@nextmade.test", "203.0.113.1", { redis, env, config, smtpSender: send })).toBe("sent");
    expect(send.mock.calls[0]![0].to).toBe("Admin@nextmade.test");
    const code = codeFrom(send);
    // Storage holds only keyed hashes: neither the code nor the email address appears.
    const stored = await readFile(file, "utf8");
    expect(stored).not.toContain(code);
    expect(stored.toLowerCase()).not.toContain("admin@nextmade.test");
    expect(await verifyLoginCode("admin@nextmade.test", code, { redis, config })).toBe(true);
    expect(await verifyLoginCode("admin@nextmade.test", code, { redis, config })).toBe(false);
  });

  it("sends nothing to non-admins (the caller shows the same message either way)", async () => {
    const send = vi.fn<SmtpSender>(async () => {});
    expect(await requestLoginCode("someone@else.test", "203.0.113.2", { redis: new LocalRedis(), env, config, smtpSender: send })).toBe("not_admin");
    expect(send).not.toHaveBeenCalled();
  });

  it("locks the code after 5 wrong attempts and rate-limits requests", async () => {
    const redis = new LocalRedis();
    const send = vi.fn<SmtpSender>(async () => {});
    await requestLoginCode("admin@nextmade.test", "203.0.113.3", { redis, env, config, smtpSender: send });
    const code = codeFrom(send);
    for (let i = 0; i < 5; i++) expect(await verifyLoginCode("admin@nextmade.test", "000000" === code ? "111111" : "000000", { redis, config })).toBe(false);
    expect(await verifyLoginCode("admin@nextmade.test", code, { redis, config })).toBe(false);

    const shared = new LocalRedis();
    for (let i = 0; i < 5; i++) await requestLoginCode("admin@nextmade.test", "203.0.113.5", { redis: shared, env, config, smtpSender: send });
    expect(await requestLoginCode("admin@nextmade.test", "203.0.113.5", { redis: shared, env, config, smtpSender: send })).toBe("rate_limited");
  });

  it("is disabled without email sending or a secret", async () => {
    expect(await requestLoginCode("admin@nextmade.test", "ip", { env: readIntakeEnv({}), config })).toBe("disabled");
    expect(await requestLoginCode("admin@nextmade.test", "ip", { env, config: readAdminConfig({ ADMIN_EMAILS: "admin@nextmade.test" }) })).toBe("disabled");
  });
});

describe("candidates", () => {
  const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
  const app = (n: number, at: string) => ({
    id: id(n),
    kind: "application" as const,
    receivedAt: at,
    data: { name: `Candidate ${n}`, role: "talent-recruiter", resume: { filename: "cv.pdf", contentType: "application/pdf", size: 9, data: "JVBERi0xLjQ=" } },
  });

  it("lists newest first from summaries, without résumé contents", async () => {
    const redis = new LocalRedis();
    const store = new RedisSubmissionStore(redis);
    await store.save(app(1, "2026-10-01T00:00:00Z"));
    await store.save(app(2, "2026-10-02T00:00:00Z"));
    const list = await listCandidates(redis);
    expect(list.map((c) => c.id)).toEqual([id(2), id(1)]);
    expect(JSON.stringify(list)).not.toContain("JVBERi");
    expect(statusOf(list[0]!)).toBe("new");
    expect((await getCandidate(redis, id(1)))?.record.data.resume).toMatchObject({ data: "JVBERi0xLjQ=" });
  });

  it("still lists older records saved before summaries existed", async () => {
    const redis = new LocalRedis();
    const legacy = app(3, "2026-09-01T00:00:00Z");
    await redis.exec([["SET", submissionKeys.record("application", legacy.id), JSON.stringify(legacy)], ["ZADD", submissionKeys.index("application"), 1, legacy.id]]);
    const [c] = await listCandidates(redis);
    expect(c?.data.name).toBe("Candidate 3");
    expect(JSON.stringify(c)).not.toContain("JVBERi");
  });

  it("saves a review that expires with the application, and deletes everything on request", async () => {
    const redis = new LocalRedis();
    await new RedisSubmissionStore(redis).save(app(4, "2026-10-03T00:00:00Z"));
    const review = { status: "interview" as const, notes: "Strong data background", updatedAt: "2026-10-04T00:00:00Z", updatedBy: "admin@x.com" };
    expect(await saveReview(redis, id(4), review)).toBe(true);
    expect((await listCandidates(redis))[0]?.review).toEqual(review);
    const [recordTtl, reviewTtl] = (await redis.exec([["TTL", submissionKeys.record("application", id(4))], ["TTL", `candidate-review:${id(4)}`]])) as number[];
    expect(Math.abs(recordTtl! - reviewTtl!)).toBeLessThanOrEqual(1);

    await deleteCandidate(redis, id(4));
    expect(await getCandidate(redis, id(4))).toBeNull();
    expect(await listCandidates(redis)).toEqual([]);
    expect(await saveReview(redis, id(4), review)).toBe(false);
  });

  it("drops expired applications from the list and ignores malformed ids", async () => {
    let now = Date.parse("2026-10-05T00:00:00Z");
    const redis = new LocalRedis(undefined, () => now);
    await new RedisSubmissionStore(redis).save(app(5, "2026-10-05T00:00:00Z"));
    now += 420 * 24 * 3600 * 1000; // past the 13 × 31-day retention
    expect(await listCandidates(redis)).toEqual([]);
    expect(await redis.exec([["ZCARD", submissionKeys.index("application")]])).toEqual([0]);
    expect(await getCandidate(redis, "../../etc")).toBeNull();
  });
});

describe("jobs storage", () => {
  it("starts from the three seed roles and then uses what the admin saved", async () => {
    const redis = new LocalRedis();
    expect((await readJobs(redis)).map((j) => [j.slug, j.status])).toEqual([
      ["senior-software-engineer-ai-ml", "open"],
      ["senior-software-engineer-data-engineering", "open"],
      ["talent-recruiter", "open"],
    ]);
    const edited = seedManagedJobs().map((j) => (j.slug === "talent-recruiter" ? { ...j, status: "closed" as const } : j));
    await writeJobs(redis, edited);
    expect((await readJobs(redis)).find((j) => j.slug === "talent-recruiter")?.status).toBe("closed");
    expect((await readJobs(undefined)).length).toBe(3);
  });
});

describe("role form", () => {
  const valid = {
    title: "Product Designer",
    team: "Design",
    summary: "Design clear, useful product experiences for our clients.",
    overview: "First paragraph.\n\nSecond paragraph.",
    workOn: "- Design flows\n• Run research\n\nShip specs",
    lookingFor: "Portfolio of shipped work",
    skills: "Figma, Research,\nPrototyping",
    location: "",
  };

  it("turns the text areas into lists and blank optional terms into null", () => {
    const p = jobPostingSchema.parse(valid);
    expect(p.overview).toEqual(["First paragraph.", "Second paragraph."]);
    expect(p.workOn).toEqual(["Design flows", "Run research", "Ship specs"]);
    expect(p.skills).toEqual(["Figma", "Research", "Prototyping"]);
    expect(p.niceToHave).toEqual([]);
    expect([p.location, p.compensation, p.shortTitle]).toEqual([null, null, null]);
  });

  it("requires the essentials", () => {
    const r = jobPostingSchema.safeParse({ ...valid, title: "", workOn: "", summary: "short" });
    expect(r.success).toBe(false);
    expect(Object.keys(r.error!.flatten().fieldErrors).sort()).toEqual(["summary", "title", "workOn"]);
  });

  it("makes stable, unique URL slugs", () => {
    expect(slugify("Senior Software Engineer — AI/ML")).toBe("senior-software-engineer-ai-ml");
    expect(slugify("Développeur Été!")).toBe("developpeur-ete");
    expect(uniqueSlug("Talent Recruiter", ["talent-recruiter", "talent-recruiter-2"])).toBe("talent-recruiter-3");
  });
});
