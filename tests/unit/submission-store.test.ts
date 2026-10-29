import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleApplication } from "@/lib/integrations/handle-application";
import { handleInquiry } from "@/lib/integrations/handle-inquiry";
import { readIntakeEnv } from "@/lib/integrations/env";
import { MemoryRateLimiter } from "@/lib/integrations/rate-limit";
import { DeliveredSubmissions } from "@/lib/integrations/submission-guard";
import { createSubmissionStore, FileSubmissionStore, UpstashSubmissionStore, type SubmissionStore } from "@/lib/integrations/submission-store";
import { sampleUuid, validApplication, validInquiry } from "./fixtures";

const req = (payload: object) => ({
  rawBody: JSON.stringify({ payload, website: "", elapsedMs: 9000, submissionId: sampleUuid }),
  contentType: "application/json",
  ip: "192.0.2.44",
  origin: null,
  host: null,
});
const deps = (env: ReturnType<typeof readIntakeEnv>, store?: SubmissionStore, fetchImpl?: typeof fetch) => ({
  env,
  store,
  fetchImpl,
  limiter: new MemoryRateLimiter(10, 60_000),
  log: vi.fn(),
  delivered: new DeliveredSubmissions(),
});
const noEmail = readIntakeEnv({});
const failingStore: SubmissionStore = { name: "file", save: async () => Promise.reject(Object.assign(new Error("disk"), { code: "EACCES" })) };

let dir: string | undefined;
afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("submission store configuration", () => {
  it("saves locally by default, is off on Vercel or when disabled, and prefers Upstash when configured", () => {
    expect(readIntakeEnv({}).submissionsDir).toBe(".data/submissions");
    expect(readIntakeEnv({ VERCEL: "1" }).submissionsDir).toBeUndefined();
    expect(readIntakeEnv({ SUBMISSIONS_DIR: "off" }).submissionsDir).toBeUndefined();
    expect(createSubmissionStore(readIntakeEnv({ VERCEL: "1" }))).toBeUndefined();
    expect(createSubmissionStore(readIntakeEnv({}))?.name).toBe("file");
    expect(createSubmissionStore(readIntakeEnv({ UPSTASH_REDIS_REST_URL: "https://u.example", UPSTASH_REDIS_REST_TOKEN: "t" }))?.name).toBe("upstash");
  });
});

describe("one-click submissions without email", () => {
  it("receives an application by saving it — no email provider needed", async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "nm-subs-"));
    const res = await handleApplication(req(validApplication), deps(noEmail, new FileSubmissionStore(dir)));
    expect(res).toMatchObject({ httpStatus: 200, body: { status: "sent" } });
    const [line] = (await readFile(path.join(dir, "applications.jsonl"), "utf8")).trim().split("\n");
    const saved = JSON.parse(line!);
    expect(saved).toMatchObject({ id: sampleUuid, kind: "application" });
    expect(saved.data).toMatchObject({ name: "Sam Okafor", email: "sam@example.com", roleTitle: "Senior Software Engineer — Data Engineering" });
    expect(saved.data.introduction).toBe(validApplication.introduction);
  });

  it("receives an inquiry by saving it", async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "nm-subs-"));
    const res = await handleInquiry(req(validInquiry), deps(noEmail, new FileSubmissionStore(dir)));
    expect(res.body).toEqual({ status: "sent" });
    const saved = JSON.parse((await readFile(path.join(dir, "inquiries.jsonl"), "utf8")).trim());
    expect(saved.data.description).toBe(validInquiry.description);
  });

  it("still succeeds when saving works but email fails, and when email works but saving fails", async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "nm-subs-"));
    const emailEnv = readIntakeEnv({ RESEND_API_KEY: "re_test" });
    const failFetch = vi.fn(async () => new Response("{}", { status: 500 }));
    expect((await handleApplication(req(validApplication), deps(emailEnv, new FileSubmissionStore(dir), failFetch as unknown as typeof fetch))).body).toEqual({ status: "sent" });
    const okFetch = vi.fn(async () => new Response("{}", { status: 200 }));
    const d = deps(emailEnv, failingStore, okFetch as unknown as typeof fetch);
    expect((await handleApplication(req(validApplication), d)).body).toEqual({ status: "sent" });
    expect(JSON.stringify(d.log.mock.calls)).toContain("store_file_EACCES");
  });

  it("reports an error only when neither saving nor email worked — never a false success", async () => {
    const res = await handleApplication(req(validApplication), deps(noEmail, failingStore));
    expect(res).toMatchObject({ httpStatus: 502, body: { status: "error" } });
    const inq = await handleInquiry(req(validInquiry), deps(noEmail, failingStore));
    expect(inq).toMatchObject({ httpStatus: 502, body: { status: "error" } });
  });

  it("never logs personal data when saving fails", async () => {
    const d = deps(noEmail, failingStore);
    await handleApplication(req(validApplication), d);
    expect(JSON.stringify(d.log.mock.calls)).not.toMatch(/Sam|sam@example|pipelines/);
  });
});

describe("Upstash store", () => {
  it("saves each submission with a retention TTL and indexes it by time", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([{ result: "OK" }, { result: 1 }]), { status: 200 }));
    const store = new UpstashSubmissionStore("https://u.example/", "token", fetchImpl as unknown as typeof fetch);
    await store.save({ id: sampleUuid, kind: "application", receivedAt: "2026-10-29T12:00:00.000Z", data: { name: "Sam" } });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://u.example/pipeline");
    const [set, zadd] = JSON.parse(String(init.body));
    expect(set.slice(0, 2)).toEqual(["SET", `submission:application:${sampleUuid}`]);
    expect(set[3]).toBe("EX");
    expect(zadd).toEqual(["ZADD", "submissions:application", String(Date.parse("2026-10-29T12:00:00.000Z")), sampleUuid]);
  });

  it("throws (so the handler can report it) when Upstash rejects the write", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 401 }));
    const store = new UpstashSubmissionStore("https://u.example", "bad", fetchImpl as unknown as typeof fetch);
    await expect(store.save({ id: sampleUuid, kind: "inquiry", receivedAt: new Date().toISOString(), data: {} })).rejects.toThrow("upstash_401");
  });
});
