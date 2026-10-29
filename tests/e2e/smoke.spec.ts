import { expect, test, type Page } from "@playwright/test";

const EMAIL = "hello@nextmadelabs.com";
const CAREERS_EMAIL = "careers@nextmadelabs.com";
const TEAM: [string, string][] = [
  ["Antonio Ortiz", "CEO"],
  ["Ricky Lee Sprouse", "CTO"],
  ["Renz Patdu", "Senior Software Engineer"],
  ["Parbin Parajuli", "Senior Software Engineer"],
  ["Joseph Zhang", "Senior Software Engineer"],
];
const JOBS: [string, string][] = [
  ["senior-software-engineer-ai-ml", "Senior Software Engineer — AI/ML"],
  ["senior-software-engineer-data-engineering", "Senior Software Engineer — Data Engineering"],
  ["talent-recruiter", "Talent Recruiter"],
];

const routes = [
  "/",
  "/services",
  "/services/custom-software-development",
  "/services/web-mobile-applications",
  "/services/ai-solutions-automation",
  "/services/system-integration-modernization",
  "/services/dedicated-engineering-teams",
  "/work",
  "/work/operations-dashboard",
  "/work/ai-intake-follow-up-agent",
  "/work/ai-ready-data-platform",
  "/work/mobile-booking-platform",
  "/work/ai-knowledge-assistant",
  "/process",
  "/about",
  "/insights",
  "/insights/how-to-scope-an-mvp",
  "/insights/evaluating-ai-automation",
  "/insights/choosing-a-software-development-partner",
  "/careers",
  ...JOBS.map(([slug]) => `/careers/${slug}`),
  "/careers/apply",
  "/contact",
  "/privacy",
  "/terms",
];

async function fillDelay(page: Page) {
  // The server rejects submissions completed faster than a person could type them.
  await page.waitForTimeout(2600);
}

test.describe("routes", () => {
  for (const route of routes) {
    test(`${route} renders with one h1, a title, and no horizontal overflow`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(/NextMade/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("unknown pages and slugs return a helpful 404", async ({ page }) => {
    expect((await page.goto("/this-page-does-not-exist"))?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/couldn.t find that page/i);
    expect((await page.goto("/services/not-a-service"))?.status()).toBe(404);
    expect((await page.goto("/careers/chief-wizard"))?.status()).toBe(404);
  });

  test("robots.txt blocks indexing and the sitemap lists the job pages", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toMatch(/Disallow: \//);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const [slug] of JOBS) expect(sitemap).toContain(`/careers/${slug}`);
    expect(sitemap).not.toContain("/careers/apply");
  });

  test("social metadata is present on key pages", async ({ page }) => {
    await page.goto("/careers/talent-recruiter");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Talent Recruiter/);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("business facts as rendered", () => {
  test("About shows the five team members in order, with initials and no photos", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText(/coming soon/i)).toHaveCount(0);
    const cards = page.locator("article[aria-labelledby^='team-']");
    await expect(cards).toHaveCount(5);
    for (const [i, [name, role]] of TEAM.entries()) {
      await expect(cards.nth(i).getByRole("heading")).toHaveText(name);
      await expect(cards.nth(i)).toContainText(role);
    }
    await expect(cards.locator("img")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Discuss Your Project" })).toHaveAttribute("href", "/contact");
    await expect(page.getByRole("link", { name: "Explore Careers" })).toHaveAttribute("href", "/careers");
  });

  test("homepage stays customer-first, names CEO/CTO, and links to careers", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Idea. Our Engineering. Real Results.");
    await expect(page.getByRole("link", { name: "Tell Us About Your Project" }).first()).toHaveAttribute("href", "/contact");
    await expect(page.getByText("Antonio Ortiz")).toBeVisible();
    await expect(page.getByText("Ricky Lee Sprouse")).toBeVisible();
    await expect(page.getByText(/explore open roles in ai\/ml, data engineering, and recruiting/i)).toBeVisible();
    await expect(page.getByText("Booking confirmed")).toHaveCount(0);
  });

  test("careers lists three roles and never says hiring is closed", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Help build what's next.");
    await expect(page.getByText(/no open roles/i)).toHaveCount(0);
    for (const [, title] of JOBS) await expect(page.getByRole("heading", { name: title, level: 3 })).toBeVisible();
  });

  test("main content never prints the email address; email links and the footer still reach the inbox", async ({ page }) => {
    for (const path of ["/", "/contact", "/careers", "/careers/talent-recruiter", "/careers/apply", "/about", "/privacy", "/terms"]) {
      await page.goto(path);
      await expect(page.locator("main")).not.toContainText(EMAIL);
      await expect(page.locator("main")).not.toContainText(CAREERS_EMAIL);
      await expect(page.locator(`footer a[href="mailto:${EMAIL}"]`)).toHaveCount(1);
    }
    await page.goto("/careers");
    await expect(page.getByRole("link", { name: "Email our hiring team" })).toHaveAttribute("href", new RegExp(`^mailto:${CAREERS_EMAIL}`));
  });

  test("concept projects are labeled as illustrative and not client work", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("not a client project")).toHaveCount(5);
    await page.goto("/work/operations-dashboard");
    await expect(page.getByText("Illustrative example", { exact: true })).toBeVisible();
  });

  test("no future-dated articles (Oct 28, 2026)", async ({ page }) => {
    await page.goto("/insights");
    await expect(page.getByText("October 29, 2026")).toHaveCount(0);
    await expect(page.getByText("October 28, 2026").first()).toBeVisible();
  });
});

test.describe("careers flow", () => {
  test("job page → Apply preselects the role; back returns to the job page", async ({ page }) => {
    for (const [slug, title] of JOBS) {
      await page.goto(`/careers/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await page.getByRole("link", { name: "Apply Now" }).click();
      await expect(page).toHaveURL(`/careers/apply?role=${slug}`);
      await expect(page.locator('select[name="role"]')).toHaveValue(slug);
      await page.goBack();
      await expect(page).toHaveURL(`/careers/${slug}`);
    }
  });

  test("careers card actions go to the right places", async ({ page }) => {
    await page.goto("/careers");
    await page.getByRole("link", { name: "View Role: Talent Recruiter" }).click();
    await expect(page).toHaveURL("/careers/talent-recruiter");
    await page.goto("/careers");
    await page.getByRole("link", { name: "Apply for Talent Recruiter" }).click();
    await expect(page.locator('select[name="role"]')).toHaveValue("talent-recruiter");
  });

  test("application: validation, then one-click submit confirms receipt with no email step", async ({ page }) => {
    await page.goto("/careers/apply?role=senior-software-engineer-data-engineering");
    await expect(page.getByText(/switched on/i)).toHaveCount(0);
    await page.getByRole("button", { name: "Submit Application" }).click();
    const summary = page.getByRole("alert", { name: /please fix/i });
    await expect(summary).toBeFocused();

    await page.getByLabel(/^Name/).fill("Sam Okafor");
    await page.getByLabel(/^Email/).fill("sam@example.com");
    await page.getByLabel("Introduce yourself").fill("I build reliable data pipelines and care about quality and testing.");
    await page.getByRole("checkbox").check();
    await fillDelay(page);
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page.getByText(/we received your application/i)).toBeVisible();
    await expect(page.getByText("Senior Software Engineer — Data Engineering").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /couldn.t send/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Send by Email" })).toHaveCount(0);
    // The careers contact link still points at the hiring inbox.
    await page.goto("/careers");
    await expect(page.getByRole("link", { name: "Email our hiring team" })).toHaveAttribute("href", new RegExp(`^mailto:${CAREERS_EMAIL}`));
  });
});

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("main nav links reach each section and mark the current page", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const [label, path] of [
      ["Services", "/services"],
      ["Work", "/work"],
      ["Process", "/process"],
      ["About", "/about"],
      ["Insights", "/insights"],
      ["Careers", "/careers"],
    ] as const) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    }
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("footer careers link works", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "See open roles" }).click();
    await expect(page).toHaveURL("/careers");
  });
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("opens as a dialog, closes with Escape, and navigates", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await trigger.click();
    await dialog.getByRole("link", { name: "Careers" }).click();
    await expect(page).toHaveURL("/careers");
    await expect(dialog).toBeHidden();
  });

  test("team names and roles fit on a phone", async ({ page }) => {
    await page.goto("/about");
    for (const [name] of TEAM) await expect(page.getByRole("heading", { name })).toBeVisible();
  });
});

test.describe("project inquiry form", () => {
  test("shows an error summary for an empty submission", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send Inquiry" }).click();
    const summary = page.getByRole("alert", { name: /please fix/i });
    await expect(summary).toContainText(/please fix 5 problems/i);
    await expect(summary).toBeFocused();
  });

  test("one-click submit confirms the inquiry was received, with no email step", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText(/switched on/i)).toHaveCount(0);
    await page.getByLabel(/^Name/).fill("Jordan Rivera");
    await page.getByLabel("Work email").fill("jordan@example.com");
    await page.getByLabel("Project type").selectOption("mvp");
    await page.getByLabel("Tell us about your project").fill("A booking tool for independent studios with payments.");
    await page.getByRole("checkbox").check();
    await fillDelay(page);
    await page.getByRole("button", { name: "Send Inquiry" }).click();
    await expect(page.getByText(/we received your inquiry/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /couldn.t send/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Send by Email" })).toHaveCount(0);
  });

  test("booking is not offered without a configured scheduler", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText(/isn.t available yet/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Email us to request a call" })).toHaveAttribute("href", new RegExp(`^mailto:${EMAIL}`));
  });
});

test.describe("API guards", () => {
  const inquiry = { name: "Bot", email: "bot@example.com", projectType: "mvp", description: "Automated submission with enough characters.", consent: true };
  const application = { name: "Bot", email: "bot@example.com", role: "talent-recruiter", introduction: "x".repeat(60), consent: true };

  test("both endpoints reject automated and cross-origin submissions, and accept genuine ones", async ({ request }) => {
    for (const [path, payload] of [["/api/inquiry", inquiry], ["/api/apply", application]] as const) {
      expect((await request.post(path, { data: { payload, website: "", elapsedMs: 10 } })).status()).toBe(400);
      expect((await request.post(path, { data: { payload, website: "spam", elapsedMs: 9000 } })).status()).toBe(400);
      expect(
        (await request.post(path, { data: { payload, website: "", elapsedMs: 9000 }, headers: { Origin: "https://evil.example" } })).status(),
      ).toBe(403);
      const ok = await request.post(path, { data: { payload, website: "", elapsedMs: 9000 } });
      expect(ok.status()).toBe(200);
      expect(await ok.json()).toEqual({ status: "sent" });
    }
  });

  test("intake status reports provider kinds only, never secrets", async ({ request }) => {
    const res = await request.get("/api/intake-status");
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ready: true, storage: "file", email: "none" });
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("each endpoint rejects the other track's payload", async ({ request }) => {
    expect((await request.post("/api/apply", { data: { payload: inquiry, website: "", elapsedMs: 9000 } })).status()).toBe(422);
    expect((await request.post("/api/inquiry", { data: { payload: application, website: "", elapsedMs: 9000 } })).status()).toBe(422);
  });

  test("responses carry security headers", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
  });
});

test.describe("legal and hiring terms", () => {
  test("Privacy Policy is active (no draft label or placeholders); Terms remain a draft", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy Policy");
    await expect(page.getByText(/not yet reviewed by legal counsel/i)).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("[");
    await expect(page.getByText(/up to 24 months/i)).toBeVisible();
    await expect(page.getByText(/up to 12 months/i)).toBeVisible();
    await expect(page.locator("footer")).toContainText("NextMade");
    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("(Draft)");
  });

  test("job pages show the confirmed location, type, and pay", async ({ page }) => {
    await page.goto("/careers/talent-recruiter");
    await expect(page.getByText("Remote — worldwide (outside the United States)").first()).toBeVisible();
    await expect(page.getByText("Full-time").first()).toBeVisible();
    await expect(page.getByText("USD 2,000 per month").first()).toBeVisible();
  });
});