import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IntakeEnv } from "@/lib/integrations/env";

/**
 * The one storage interface behind submissions, jobs, candidate reviews, and admin sign-in codes.
 *
 * Production talks to Upstash Redis over its REST pipeline API. Local development and tests use `LocalRedis`,
 * which implements the same small command subset in memory and (optionally) persists to one JSON file, so every
 * environment runs the same code paths. Server-only: never import from a Client Component.
 */

export type Command = (string | number)[];

export interface Redis {
  readonly name: "upstash" | "file" | "memory";
  /** Runs the commands in order and returns each result, like a Redis pipeline. Throws on any failure. */
  exec(commands: Command[]): Promise<unknown[]>;
}

export class UpstashRedis implements Redis {
  readonly name = "upstash" as const;
  constructor(
    private url: string,
    private token: string,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  async exec(commands: Command[]): Promise<unknown[]> {
    const res = await this.fetchImpl(`${this.url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands.map((c) => c.map(String))),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`upstash_${res.status}`);
    const results = (await res.json()) as { result?: unknown; error?: string }[];
    if (results.some((r) => r.error)) throw new Error("upstash_command_error");
    return results.map((r) => r.result ?? null);
  }
}

type Entry = { t: "s"; v: string; e?: number } | { t: "z"; m: Record<string, number>; e?: number };

/** In-process Redis subset: GET SET(EX) DEL MGET INCR EXPIRE PEXPIRE(NX) TTL PTTL ZADD ZREM ZRANGE(REV) ZCARD. */
export class LocalRedis implements Redis {
  readonly name: "file" | "memory";
  private data = new Map<string, Entry>();
  private loadedVersion = "";
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private file?: string,
    private now: () => number = Date.now,
  ) {
    this.name = file ? "file" : "memory";
  }

  exec(commands: Command[]): Promise<unknown[]> {
    // Serialize pipelines so concurrent requests can't interleave read-modify-write cycles.
    const run = this.queue.then(() => this.run(commands));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async run(commands: Command[]): Promise<unknown[]> {
    await this.load();
    let dirty = false;
    const out = commands.map((cmd) => {
      const [op, ...args] = cmd.map(String);
      const { result, write } = this.apply(op!.toUpperCase(), args);
      dirty ||= write;
      return result;
    });
    if (dirty) await this.persist();
    return out;
  }

  private live(key: string): Entry | undefined {
    const e = this.data.get(key);
    if (e?.e !== undefined && e.e <= this.now()) {
      this.data.delete(key);
      return undefined;
    }
    return e;
  }

  private apply(op: string, a: string[]): { result: unknown; write: boolean } {
    const read = (result: unknown) => ({ result, write: false });
    const wrote = (result: unknown) => ({ result, write: true });
    switch (op) {
      case "GET": {
        const e = this.live(a[0]!);
        return read(e?.t === "s" ? e.v : null);
      }
      case "MGET":
        return read(a.map((k) => {
          const e = this.live(k);
          return e?.t === "s" ? e.v : null;
        }));
      case "SET": {
        const exIdx = a.findIndex((x, i) => i >= 2 && x.toUpperCase() === "EX");
        const e = exIdx >= 0 ? this.now() + Number(a[exIdx + 1]) * 1000 : undefined;
        this.data.set(a[0]!, { t: "s", v: a[1]!, ...(e ? { e } : {}) });
        return wrote("OK");
      }
      case "DEL": {
        let n = 0;
        for (const k of a) if (this.live(k) && this.data.delete(k)) n++;
        return wrote(n);
      }
      case "INCR": {
        const e = this.live(a[0]!);
        const v = (e?.t === "s" ? Number(e.v) : 0) + 1;
        this.data.set(a[0]!, { t: "s", v: String(v), ...(e?.e ? { e: e.e } : {}) });
        return wrote(v);
      }
      case "EXPIRE":
      case "PEXPIRE": {
        const e = this.live(a[0]!);
        if (!e) return read(0);
        if (a[2]?.toUpperCase() === "NX" && e.e !== undefined) return read(0);
        e.e = this.now() + Number(a[1]) * (op === "EXPIRE" ? 1000 : 1);
        return wrote(1);
      }
      case "TTL":
      case "PTTL": {
        const e = this.live(a[0]!);
        if (!e) return read(-2);
        if (e.e === undefined) return read(-1);
        const ms = e.e - this.now();
        return read(op === "TTL" ? Math.ceil(ms / 1000) : ms);
      }
      case "ZADD": {
        const e = this.live(a[0]!);
        const z = e?.t === "z" ? e : ({ t: "z", m: {} } as Extract<Entry, { t: "z" }>);
        let added = 0;
        for (let i = 1; i + 1 < a.length; i += 2) {
          if (!(a[i + 1]! in z.m)) added++;
          z.m[a[i + 1]!] = Number(a[i]);
        }
        this.data.set(a[0]!, z);
        return wrote(added);
      }
      case "ZREM": {
        const e = this.live(a[0]!);
        if (e?.t !== "z") return read(0);
        let n = 0;
        for (const m of a.slice(1)) if (m in e.m && delete e.m[m]) n++;
        return wrote(n);
      }
      case "ZCARD": {
        const e = this.live(a[0]!);
        return read(e?.t === "z" ? Object.keys(e.m).length : 0);
      }
      case "ZRANGE": {
        const e = this.live(a[0]!);
        if (e?.t !== "z") return read([]);
        const rev = a.slice(3).some((x) => x.toUpperCase() === "REV");
        const sorted = Object.entries(e.m)
          .sort(([ma, sa], [mb, sb]) => (sa - sb) || ma.localeCompare(mb))
          .map(([m]) => m);
        if (rev) sorted.reverse();
        const start = Number(a[1]);
        const stop = Number(a[2]);
        return read(sorted.slice(start, stop < 0 ? sorted.length + stop + 1 : stop + 1));
      }
      default:
        throw new Error(`local_redis_unsupported_${op}`);
    }
  }

  private async load() {
    // File mode re-reads when the file changed on disk: build workers and the server may share it.
    if (!this.file) return;
    try {
      const { mtimeMs, size } = await stat(/*turbopackIgnore: true*/ this.file);
      const version = `${mtimeMs}:${size}`;
      if (version === this.loadedVersion) return;
      const raw = JSON.parse(await readFile(/*turbopackIgnore: true*/ this.file, "utf8")) as Record<string, Entry>;
      this.data = new Map(Object.entries(raw));
      this.loadedVersion = version;
    } catch (err) {
      if ((err as { code?: string }).code !== "ENOENT") throw err;
    }
  }

  private async persist() {
    if (!this.file) return;
    await mkdir(path.dirname(/*turbopackIgnore: true*/ this.file), { recursive: true, mode: 0o700 });
    const tmp = `${this.file}.tmp`;
    await writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(Object.fromEntries(this.data)), { encoding: "utf8", mode: 0o600 });
    await rename(/*turbopackIgnore: true*/ tmp, /*turbopackIgnore: true*/ this.file);
    const { mtimeMs, size } = await stat(/*turbopackIgnore: true*/ this.file);
    this.loadedVersion = `${mtimeMs}:${size}`;
  }
}

const localByFile = new Map<string, LocalRedis>();

/** Upstash when configured (production); a JSON file under SUBMISSIONS_DIR for local runs; otherwise none. */
export function createRedis(env: IntakeEnv): Redis | undefined {
  if (env.upstashUrl && env.upstashToken) return new UpstashRedis(env.upstashUrl, env.upstashToken);
  if (env.submissionsDir) {
    const file = path.resolve(/*turbopackIgnore: true*/ env.submissionsDir, "local-redis.json");
    let r = localByFile.get(file);
    if (!r) localByFile.set(file, (r = new LocalRedis(file)));
    return r;
  }
  return undefined;
}
