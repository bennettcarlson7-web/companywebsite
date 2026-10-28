import { expect, test } from "@playwright/test";

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
  "/work/mobile-booking-platform",
  "/work/ai-knowledge-assistant",
  "/process",
  "/about",
  "/insights",
  "/insights/how-to-scope-an-mvp",
  "/insights/evaluating-ai-automation",
  "/insights/choosing-a-software-development-partner",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
];

test.describe("routes", () => {
  for (const route of routes) {
    test(`${route} renders with one h1 and no horizontal overflow`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("unknown pages return a helpful 404", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/couldn.t find that page/i);
  });

  test("unknown dynamic slugs return 404", async ({ page }) => {
    const res = await page.goto("/services/not-a-service");
    expect(res?.status()).toBe(404);
  });

  test("robots.txt blocks indexing until explicitly enabled", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/Disallow: \//);
  });
});

test.describe("honesty guardrails", () => {
  test("concept projects are labeled as illustrative", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("Illustrative project")).toHaveCount(3);
    await page.goto("/work/operations-dashboard");
    await expect(page.getByText("Illustrative example", { exact: true })).toBeVisible();
  });

  test("careers page does not invent open roles", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: /no open roles listed right now/i })).toBeVisible();
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

  test("primary CTA leads to the inquiry form", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Tell Us About Your Project" }).first().click();
    await expect(page).toHaveURL("/contact");
    await expect(page.getByRole("heading", { name: "Project inquiry" })).toBeVisible();
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("opens, traps focus in a dialog, closes with Escape, and navigates", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await dialog.getByRole("link", { name: "Process" }).click();
    await expect(page).toHaveURL("/process");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/clear path/i);
  });
});

test.describe("contact form", () => {
  test("shows an error summary for an empty submission", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send Inquiry" }).click();
    const summary = page.getByRole("alert", { name: /please fix/i });
    await expect(summary).toContainText(/please fix 5 problems/i);
    await expect(summary).toBeFocused();
    await expect(page.getByLabel("Work email")).toHaveAttribute("aria-invalid", "true");
  });

  test("in unconfigured mode, it never claims the inquiry was sent", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText(/demo mode/i)).toBeVisible();

    await page.getByLabel(/^Name/).fill("Jordan Rivera");
    await page.getByLabel("Work email").fill("jordan@example.com");
    await page.getByLabel("Project type").selectOption("mvp");
    await page.getByLabel("Tell us about your project").fill("A booking tool for independent studios with payments.");
    await page.getByRole("checkbox").check();
    // The server rejects submissions completed faster than a person could type them.
    await page.waitForTimeout(2600);
    await page.getByRole("button", { name: "Send Inquiry" }).click();

    await expect(page.getByRole("heading", { name: /has not been sent/i })).toBeVisible();
    await expect(page.getByText(/we received your inquiry/i)).toHaveCount(0);
    await expect(page.getByLabel("Your project summary")).toHaveValue(/Name: Jordan Rivera/);

    await page.getByRole("button", { name: "Edit Details" }).click();
    await expect(page.getByLabel(/^Name/)).toHaveValue("Jordan Rivera");
  });

  test("the API rejects automated and cross-origin submissions", async ({ request, baseURL }) => {
    const inquiry = {
      name: "Bot",
      email: "bot@example.com",
      projectType: "mvp",
      description: "Automated submission with enough characters.",
      consent: true,
    };
    const fast = await request.post("/api/inquiry", { data: { inquiry, website: "", elapsedMs: 10 } });
    expect(fast.status()).toBe(400);
    const honeypot = await request.post("/api/inquiry", { data: { inquiry, website: "spam", elapsedMs: 9000 } });
    expect(honeypot.status()).toBe(400);
    const cross = await request.post("/api/inquiry", {
      data: { inquiry, website: "", elapsedMs: 9000 },
      headers: { Origin: "https://evil.example" },
    });
    expect(cross.status()).toBe(403);
    expect(baseURL).toBeTruthy();
  });
});
