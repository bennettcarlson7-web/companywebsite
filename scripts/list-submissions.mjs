// Lists saved applications and project inquiries, newest first.
// Usage: npm run submissions [-- applications|inquiries] [-- --limit 20]
// Reads Upstash when UPSTASH_REDIS_REST_URL/TOKEN are set (production data), otherwise .data/submissions.
import { readFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const only = args.find((a) => a === "applications" || a === "inquiries");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 20 : 50;
const kinds = only === "applications" ? ["application"] : only === "inquiries" ? ["inquiry"] : ["application", "inquiry"];

const val = (v) => (v && v.trim() ? v.trim() : undefined);
const upstashUrl = val(process.env.UPSTASH_REDIS_REST_URL);
const upstashToken = val(process.env.UPSTASH_REDIS_REST_TOKEN);

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

async function fromFile(kind) {
  const dir = path.resolve(val(process.env.SUBMISSIONS_DIR) ?? ".data/submissions");
  try {
    const text = await readFile(path.join(dir, kind === "application" ? "applications.jsonl" : "inquiries.jsonl"), "utf8");
    return text.split("\n").filter(Boolean).map((l) => JSON.parse(l)).reverse().slice(0, limit);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

const source = upstashUrl && upstashToken ? "Upstash" : "local files";
console.log(`Source: ${source}\n`);
for (const kind of kinds) {
  const items = upstashUrl && upstashToken ? await fromUpstash(kind) : await fromFile(kind);
  console.log(`== ${kind === "application" ? "Applications" : "Project inquiries"} (${items.length}) ==`);
  for (const s of items) {
    const d = s.data ?? {};
    console.log(`\n${new Date(s.receivedAt).toLocaleString()}  ·  ${d.name} <${d.email}>`);
    if (kind === "application") {
      console.log(`  Role: ${d.roleTitle ?? d.role}`);
      for (const [label, key] of [["LinkedIn", "linkedinUrl"], ["Portfolio", "portfolioUrl"], ["Résumé", "resumeUrl"]]) if (d[key]) console.log(`  ${label}: ${d[key]}`);
      console.log(`  ${String(d.introduction ?? "").replace(/\n/g, "\n  ")}`);
    } else {
      console.log(`  Type: ${d.projectType ?? "-"}  Budget: ${d.budget ?? "-"}  Timeline: ${d.timeline ?? "-"}  Company: ${d.company ?? "-"}`);
      console.log(`  ${String(d.description ?? "").replace(/\n/g, "\n  ")}`);
    }
  }
  console.log("");
}
