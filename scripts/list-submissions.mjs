// Lists saved applications and project inquiries, newest first.
// Usage: npm run submissions [-- applications|inquiries] [-- --limit 20] [-- --save-resumes]
// Reads Upstash when UPSTASH_REDIS_REST_URL/TOKEN are set (production data), otherwise .data/submissions.
// --save-resumes writes each attached résumé to .data/resumes/ (git-ignored).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const saveResumes = args.includes("--save-resumes");
const resumeDir = path.resolve(".data/resumes");
const only = args.find((a) => a === "applications" || a === "inquiries");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 20 : 50;
const kinds = only === "applications" ? ["application"] : only === "inquiries" ? ["inquiry"] : ["application", "inquiry"];

const val = (v) => (v && v.trim() ? v.trim() : undefined);
const upstashUrl = val(process.env.UPSTASH_REDIS_REST_URL) ?? val(process.env.KV_REST_API_URL);
const upstashToken = val(process.env.UPSTASH_REDIS_REST_TOKEN) ?? val(process.env.KV_REST_API_TOKEN);

async function fromUpstash(kind) {
  const call = async (commands) => {
    const res = await fetch(`${upstashUrl.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${upstashToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
    return res.json();
  };
  const [{ result: ids = [] }] = await call([["ZRANGE", `submissions:${kind}`, "0", String(limit - 1), "REV"]]);
  if (!ids.length) return [];
  const rows = await call(ids.map((id) => ["GET", `submission:${kind}:${id}`]));
  return rows.map((r) => r.result).filter(Boolean).map((s) => JSON.parse(s));
}

/** Local runs store data in <SUBMISSIONS_DIR>/local-redis.json (same keys as Upstash); older runs used .jsonl files. */
async function fromFile(kind) {
  const dir = path.resolve(val(process.env.SUBMISSIONS_DIR) ?? ".data/submissions");
  const read = async (file) => {
    try {
      return await readFile(path.join(dir, file), "utf8");
    } catch (err) {
      if (err.code === "ENOENT") return null;
      throw err;
    }
  };
  const items = [];
  const db = await read("local-redis.json");
  if (db) {
    const data = JSON.parse(db);
    const live = (e) => e && (e.e === undefined || e.e > Date.now());
    const index = data[`submissions:${kind}`];
    const ids = live(index) ? Object.entries(index.m).sort(([, a], [, b]) => b - a).map(([id]) => id) : [];
    for (const id of ids) {
      const rec = data[`submission:${kind}:${id}`];
      if (live(rec)) items.push(JSON.parse(rec.v));
    }
  }
  const legacy = await read(kind === "application" ? "applications.jsonl" : "inquiries.jsonl");
  if (legacy) items.push(...legacy.split("\n").filter(Boolean).map((l) => JSON.parse(l)).reverse());
  return items.slice(0, limit);
}

const source = upstashUrl && upstashToken ? "Upstash" : "local files";
console.log(`Source: ${source}\n`);
for (const kind of kinds) {
  const items = upstashUrl && upstashToken ? await fromUpstash(kind) : await fromFile(kind);
  console.log(`== ${kind === "application" ? "Applications" : "Project inquiries"} (${items.length}) ==`);
  const ageRanges = {};
  for (const s of items) {
    const d = s.data ?? {};
    console.log(`\n${new Date(s.receivedAt).toLocaleString()}  ·  ${d.name} <${d.email}>`);
    if (kind === "application") {
      console.log(`  Role: ${d.roleTitle ?? d.role}`);
      if (d.phone) console.log(`  Phone: ${d.phone}`);
      if (d.city) console.log(`  Location: ${d.city}, ${d.countryName ?? d.country}`);
      if (d.gender) console.log(`  Gender: ${d.gender === "decline" ? "Not disclosed" : d.gender}`);
      if (d.ageRange) {
        console.log(`  Age range: ${d.ageRange === "decline" ? "Not disclosed" : d.ageRange}`);
        ageRanges[d.ageRange] = (ageRanges[d.ageRange] ?? 0) + 1;
      }
      if (d.resume?.filename) {
        let saved = "";
        if (saveResumes && d.resume.data) {
          await mkdir(resumeDir, { recursive: true });
          const file = path.join(resumeDir, `${s.id.slice(0, 8)}-${path.basename(d.resume.filename)}`);
          await writeFile(file, Buffer.from(d.resume.data, "base64"));
          saved = ` → saved to ${file}`;
        }
        console.log(`  Résumé: ${d.resume.filename}${saved}`);
      }
      for (const [label, key] of [["Video", "videoUrl"], ["LinkedIn", "linkedinUrl"], ["Portfolio", "portfolioUrl"], ["Résumé link", "resumeUrl"]]) if (d[key]) console.log(`  ${label}: ${d[key]}`);
      // Older applications (before the video field) had a written introduction.
      if (d.introduction) console.log(`  ${String(d.introduction).replace(/\n/g, "\n  ")}`);
    } else {
      console.log(`  Type: ${d.projectType ?? "-"}  Budget: ${d.budget ?? "-"}  Timeline: ${d.timeline ?? "-"}  Company: ${d.company ?? "-"}`);
      console.log(`  ${String(d.description ?? "").replace(/\n/g, "\n  ")}`);
    }
  }
  if (Object.keys(ageRanges).length) {
    const totals = Object.entries(ageRanges).map(([range, n]) => `${range === "decline" ? "Declined" : range}: ${n}`);
    console.log(`\n  Age range totals: ${totals.join(" · ")}`);
  }
  console.log("");
}
