# Market strategy & talent plan — California, New York, Texas (Oct 2026)

Prepared by engineering leadership for the founders. It covers where demand is, what the market and investors
recognize, the talent we need, and what changed on the website as a result.

**About the sources.** LinkedIn, Facebook and Reddit content can't be read directly by automated research: they need
a login or block automated access. LinkedIn findings come from LinkedIn's published *Jobs on the Rise* data, as
reported by CNBC and others. Reddit and Facebook community sentiment could **not** be sampled; a founder should spend
an hour reading r/startups, r/smallbusiness, r/ExperiencedDevs, and local founder Facebook groups to check the
assumptions below. Many figures come from recruiting or vendor reports, so treat numbers as directional. Sources are at
the end.

## 1. What's in demand, by state

| | California | New York | Texas |
| --- | --- | --- | --- |
| Demand volume | Largest AI job market (~22% of U.S. AI-engineering postings; ~11.6k AI vacancies in Q1 2026) | ~4.8k AI vacancies (Q1 2026); NYC metro has the most AI-skilled postings of any metro | ~4.1k AI vacancies (Q1 2026); projected to add the most net new tech jobs (~32k) |
| Where money flows | AI models, infrastructure and agents; defense tech (Anduril, Castelion); AI-driven health benefits | AI took ~half of Q2 2026 NYC venture dollars; **finance** (~$2.5B) and **health tech** (~$1.1B) lead; AI + enterprise software ~45% of seed | AI **data centers** and the **energy** to power them; enterprise AI in Dallas–Fort Worth; Austin tech |
| What clients buy | AI agents and LLM features in products; developer platforms; rapid MVPs for funded startups | AI in regulated workflows: compliance, underwriting, claims, clinical ops, document processing | Ops and data modernization for energy, logistics, manufacturing and field services; AI on industrial data |
| Our best entry | Funded startups needing a senior team to ship an AI-native MVP | Mid-market finance and health firms that need *careful* AI (audit trails, privacy) | Operations-heavy companies needing data platforms + integrations before AI |

**Cross-state signals**
- *AI engineer* is the #1 fastest-growing U.S. job on LinkedIn. AI consultant/strategist is close behind.
- *Forward-deployed engineers*, who sit with customers and ship, went from about 200 U.S. postings (2024) to 5,200+ in the first seven months
  of 2026. LinkedIn reports a median pay of about $199k (AI engineer: about $166k).
- AI/ML postings were up 101% year over year (Dice/Lightcast). Jobs mentioning AI drove 37% of software-posting growth (Indeed
  Hiring Lab).
- Buyers have moved past AI experiments. They expect production LLM pipelines, RAG, and agents that integrate with
  existing systems. Integration is where most projects fail, and phased rollouts that prove one workflow first win.

## 2. Technology we should be visibly strong in

1. **AI agents and LLM applications**: tool calling, MCP, RAG, evaluation suites, guardrails, human-in-the-loop
   approval, cost/latency monitoring.
2. **Data engineering for AI**: pipelines, dbt/SQL modeling, warehouses, lineage, access control. "AI-ready data" is
   the prerequisite most clients lack.
3. **Integrations and modernization**: CRMs, ERPs, billing and scheduling APIs, with retries, alerts and audit trails.
4. **Full-stack product delivery**: TypeScript/React/Next.js, React Native, Node/Python, Postgres, AWS/GCP/Azure.
5. **Security and compliance by default**, our differentiator in New York finance and health: least-privilege
   access, data-retention rules, audit logs. SOC 2 readiness comes later.

These map onto our existing four service lines. No new service line is needed. The change is emphasis.

## 3. What the market and investors acknowledge

**Clients choosing a software partner**, in rough order of weight:
1. **Shipped work like theirs**: published, client-approved case studies with real outcomes. This is our biggest
   gap. We have none yet, and we must not invent them.
2. **Verified reviews** (Clutch, G2, Google), especially from the last 12 months, with specifics.
3. **Security posture**: a SOC 2 Type I report, then Type II (about a 12-month observation window), for enterprise and
   regulated clients. ISO 27001 matters in some sectors.
4. **Cloud and AI partner status** (AWS, Google Cloud, Microsoft partner programs; AI-provider partner directories).
5. **Visible engineering practice**: release discipline, incident communication, public writing, open-source
   contributions, conference talks.
6. **Repeat and referenceable clients**: retainers and second projects are the strongest proof.

**Investors** (relevant if we build a product or raise):
- Revenue quality beats vanity metrics. Sign-ups, downloads and logos without retention count for little.
- Benchmarks for AI startups vary widely. Roughly: seed at $0.5–2M ARR; Series A around $1–3.5M ARR, growing
  100–200% a year; net revenue retention of 120% or more; burn multiple under 1.5–2. **Gross margin** gets scrutiny, since AI products often land
  at 25–65% versus 80–90% for classic SaaS.
- Services firms are valued on recurring revenue (retainers), margins, utilization, client concentration, and any
  **productized IP**, such as reusable agent frameworks or accelerators.

### Milestones to aim for (proposed, owner review)

| Horizon | Milestone | Why it matters |
| --- | --- | --- |
| 0–3 months | Email, analytics and policies live; first 2–3 paid projects; written permission to publish one case study | Turns concepts into proof |
| 3–6 months | 3 verified Clutch/Google reviews; one published case study with client-approved numbers; a cloud partner registration | Buyer trust signals |
| 6–12 months | SOC 2 Type I; 2+ retainer clients; one reusable accelerator (e.g. an agent + evaluation starter kit) | Unlocks regulated clients; recurring revenue |
| 12–18 months | SOC 2 Type II; under 30% of revenue from any single client | Enterprise readiness; healthier business |

## 4. Talent we need

**Today:** CEO, CTO and three Senior Software Engineers. **Open roles on the site:** Senior SWE — AI/ML, Senior SWE —
Data Engineering, and Talent Recruiter. These match the market well: AI engineering and data engineering are the two
most-demanded skill sets, and a recruiter is needed to compete for them.

**Recommended next hires (proposed, NOT posted).** Each needs a confirmed budget, location policy and pay range first.

| Priority | Role | Why | Trigger to open |
| --- | --- | --- | --- |
| 1 | **Forward-Deployed / Solutions Engineer** | Fastest-growing role; sits with clients, scopes, and ships. Turns sales conversations into delivered work | First 2–3 concurrent client projects |
| 2 | **Product Designer (UX/UI)** | Every web/mobile/AI project needs it; engineers shouldn't design flows alone | When design becomes a bottleneck on two projects |
| 3 | **Technical Delivery Lead / Engineering Manager** | Keeps several client projects predictable; frees the CTO | 4+ engineers on client work |
| 4 | **Business Development / Partnerships** (NY finance/health or TX energy/industrial focus) | Founders sell first; this scales a chosen vertical | Repeatable offer + first case study |
| 5 | **Cloud / Platform Engineer (DevOps, security)**, possibly fractional at first | Infrastructure, CI/CD, SOC 2 controls | Starting SOC 2 or 3+ production systems |

**Hiring practice**
- **Pay transparency:** California (15+ employees) and New York (4+) require pay ranges in postings, including remote
  roles that could be filled there. Texas has no statewide law, but posting a remote role nationally pulls in other
  states' rules. **Confirm pay ranges with counsel before promoting any role publicly** (docs/OWNER_DECISIONS.md #14).
- **Competing for AI talent:** we can't win on salary against big tech. We can win on ownership, variety of client
  problems, senior peers, and remote flexibility, and the careers page already says this.
- Consider contract-to-hire for the first forward-deployed engineer, to keep costs tied to client revenue.

## 5. What changed on the website (this update)

- **Domain and email:** `nextmadelabs.com` is the canonical URL. Client email is `hello@`, hiring email is `careers@`. The site
  sends as `notifications@` via Resend. There's an optional confirmation to the client or candidate. See `docs/EMAIL_SETUP.md`.
- **Portfolio:** two new **concept** projects matching the top demand: an *AI agent for client intake & follow-up*
  (agents, human-in-the-loop, CRM integration; fits NY professional services and health) and an *AI-ready data platform*
  (data engineering for operations-heavy businesses; fits TX energy, logistics and manufacturing). Both carry the
  "Illustrative concept — not a client project" label. The home page features the top three.
- **Roles:** the AI/ML role now covers AI agents and tool calling (MCP). The Data role covers AI-ready, governed datasets.
  The Recruiter role covers multi-state talent markets and pay-transparency compliance.
- **Not changed, on purpose:** no new public job openings (they need budget, pay ranges and legal review); no claimed clients,
  metrics, certifications or partner badges (we have none yet).

## Sources
- Broadbean — State of AI recruitment 2026: https://www.broadbean.com/resources/blog/recruitment/the-state-of-ai-recruitment-in-2026-us-salaries-job-titles-and-year-on-year-growth/
- Axial Search — AI engineering job demand (43k postings): https://axialsearch.com/insights/ai-engineering-job-demand
- Axial Search — AI product hiring: https://axialsearch.com/insights/ai-product-job-demand
- Productive — States competing for AI talent: https://productive.io/blog/americas-ai-hiring-boom/
- Second Talent — Tech job market trends 2026: https://www.secondtalent.com/resources/tech-job-market-trends/
- CNBC — LinkedIn study, fast-growing AI jobs: https://www.cnbc.com/make-it/2026/08/18/millennials-and-gen-z-are-landing-fast-growing-high-paying-ai-jobs-linkedin-study.html
- HeroHunt — Fastest-growing AI roles 2026: https://www.herohunt.ai/blog/fastest-growing-ai-roles-in-2026-data-and-rankings/
- AlleyWatch — NYC Q2 2026 funding: https://www.alleywatch.com/2026/07/nyc-startup-funding-q2-2026-best-capital-quarter-since-2021/
- Tech:NYC — H1 2026 seed analysis: https://www.blog.technyc.org/news/seed-funding-analysis-h1-2026
- Houston Chronicle — Texas data centers: https://www.houstonchronicle.com/projects/2026/timeline-texas-data-centers/
- KERA — Texas AI data centers: https://www.keranews.org/science-technology/2026-03-25/how-texas-could-soon-have-more-ai-data-centers-than-anywhere-else-in-the-world
- Crunchbase — Defense tech funding: https://news.crunchbase.com/tag/defense-tech/
- Startup CFO — Series A ARR benchmarks 2026: https://www.startupcfo.ai/insights/series-a-arr-benchmarks-2026
- ValueAdd VC — Series A bar for AI: https://valueaddvc.com/blog/what-series-a-investors-are-looking-for-in-ai-startups-in-2026
- AI Business — AI startup metrics: https://aibusiness.vc/startups/ai-startup-metrics-investors-track
- Innotech Insider — Boutique agencies & AI: https://innotechinsider.com/biz-it/boutique-agencies-ai-custom-software-development/
- NerdHeadz — AI project integration: https://www.nerdheadz.com/blog/custom-software-development-agency-ai-project
- YUSMP — AI integration in enterprise software: https://yusmpgroup.com/blog/ai-integration-enterprise-software-2026
- Fora Soft — Choosing a software company (Clutch criteria): https://www.forasoft.com/blog/article/fora-soft-clutch-1000-2025
- Paychex — Pay transparency laws by state: https://www.paychex.com/articles/compliance/pay-transparency-laws-by-state
- Beancount — Pay transparency & remote hiring 2026: https://beancount.io/blog/2026/07/28/pay-transparency-laws-2026-remote-hiring-guide
