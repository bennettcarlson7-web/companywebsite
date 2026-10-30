import { expect, test, type Page } from "@playwright/test";
import { deriveSessionKey, signSession } from "../../src/lib/admin/token";

// Must match playwright.config.ts (test-only values).
const ADMIN = "admin@e2e.test";
const SECRET = "e2e-only-admin-session-secret-not-for-production";

async function signIn(page: Page, email = ADMIN) {
  const { hostname } = new URL(test.info().project.use.baseURL!);
  await page.context().addCookies([
    { name: "nm_admin", value: signSession(email, deriveSessionKey(SECRET)), domain: hostname, path: "/admin", httpOnly: true, sameSite: "Lax" },
  ]);
}

test.describe("admin access", () => {
  test("every admin page requires sign-in, and admin pages are never indexed", async ({ page, request }) => {
    for (const path of ["/admin", "/admin/candidates", "/admin/roles", "/admin/roles/new"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
    await expect(page.getByRole("heading", { name: "Sign in to Admin" })).toBeVisible();
    // No email provider in tests, so the page explains sign-in isn't available rather than pretending to send.
    await expect(page.getByText(/isn.t set up for this website yet/)).toBeVisible();

    const res = await request.get("/admin/login");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
    expect(res.headers()["cache-control"]).toContain("no-store");
    expect((await request.get("/admin/candidates/00000000-0000-4000-8000-000000000000/resume")).status()).toBe(404);
  });

  test("a forged or non-admin session is rejected", async ({ page }) => {
    await signIn(page, "intruder@e2e.test");
    await page.goto("/admin/candidates");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.context().addCookies([{ name: "nm_admin", value: "forged.token", domain: "127.0.0.1", path: "/admin" }]);
    await page.goto("/admin/roles");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("the public site header and footer don't appear in the admin area", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/candidates");
    await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start a Project" })).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
  });
});

test.describe("admin: candidates", () => {
  test("a new application appears in the list; the admin reviews it, downloads the résumé, and deletes it", async ({ page, request }, info) => {
    test.setTimeout(90_000);
    const name = `E2E Candidate ${info.project.name} ${Date.now()}`;
    const pdf = Buffer.from("%PDF-1.4\n% e2e admin résumé\n%%EOF\n");
    const apply = await request.post("/api/apply", {
      data: {
        payload: {
          name,
          email: "candidate@example.com",
          phone: "+63 917 123 4567",
          city: "Manila",
          country: "PH",
          gender: "woman",
          ageRange: "25-34",
          role: "talent-recruiter",
          linkedinUrl: "https://www.linkedin.com/in/e2e-candidate",
          videoUrl: "https://www.loom.com/share/e2e-candidate",
          resume: { name: "E2E CV.pdf", data: pdf.toString("base64") },
          consent: true,
        },
        website: "",
        elapsedMs: 9000,
      },
    });
    expect(await apply.json()).toEqual({ status: "sent" });

    await signIn(page);
    await page.goto(`/admin/candidates?q=${encodeURIComponent(name)}`);
    const row = page.getByRole("row", { name: new RegExp(name) });
    await expect(row).toContainText("Talent Recruiter");
    await expect(row).toContainText("Manila, Philippines");
    await expect(row).toContainText("New");
    await row.getByRole("link", { name }).click();

    // Generous wait: the candidate page renders on demand, which is slow while the parallel suite loads the machine.
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible({ timeout: 15_000 });
    for (const text of ["+63 917 123 4567", "Manila, Philippines", "Woman", "25–34"]) {
      await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
    }
    for (const href of ["https://www.linkedin.com/in/e2e-candidate", "https://www.loom.com/share/e2e-candidate"]) {
      await expect(page.locator(`a[href="${href}"][target="_blank"][rel~="noopener"]`)).toBeVisible();
    }

    // Résumé download: the original file, as an attachment.
    const download = await page.request.get(await page.getByRole("link", { name: "Download" }).getAttribute("href").then((h) => h!));
    expect(download.status()).toBe(200);
    expect(download.headers()["content-type"]).toBe("application/pdf");
    expect(download.headers()["content-disposition"]).toContain("attachment");
    expect(Buffer.from(await download.body()).equals(pdf)).toBe(true);

    // Review: status + private notes persist.
    await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("interview");
    await page.getByRole("textbox", { name: "Private notes" }).fill("Strong sourcing experience. Schedule a call.");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("combobox", { name: "Status", exact: true })).toHaveValue("interview");
    await expect(page.getByRole("textbox", { name: "Private notes" })).toHaveValue("Strong sourcing experience. Schedule a call.");
    await expect(page.getByText(`by ${ADMIN}`)).toBeVisible();

    await page.goto(`/admin/candidates?status=interview&q=${encodeURIComponent(name)}`);
    await expect(page.getByRole("row", { name: new RegExp(name) })).toContainText("Interview");

    // Delete (data-removal request): gone everywhere, including the résumé.
    await page.getByRole("link", { name }).click();
    const resumeHref = (await page.getByRole("link", { name: "Download" }).getAttribute("href"))!;
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Delete application" }).click();
    await expect(page).toHaveURL(/\/admin\/candidates\?deleted=1$/);
    await expect(page.getByText("permanently deleted")).toBeVisible();
    await page.goto(`/admin/candidates?q=${encodeURIComponent(name)}`);
    await expect(page.getByRole("heading", { level: 1, name: "Candidates" })).toBeVisible();
    await expect(page.getByRole("link", { name })).toHaveCount(0);
    expect((await page.request.get(resumeHref)).status()).toBe(404);
  });
});

test.describe("admin: roles", () => {
  test("post a role, see it on the careers site, receive an application, withdraw it, and re-open it", async ({ page, request }, info) => {
    test.setTimeout(120_000); // one long journey across admin and public pages
    const title = `QA Analyst ${info.project.name} ${Date.now()}`;
    await signIn(page);
    await page.goto("/admin/roles");
    await page.getByRole("link", { name: "Post a new role" }).click();

    // Validation keeps what was typed.
    await page.getByLabel(/^Job title/).fill(title);
    await page.getByRole("button", { name: "Post role" }).click();
    await expect(page.getByRole("alert").first()).toContainText("Please fix the highlighted fields");
    await expect(page.getByLabel(/^Job title/)).toHaveValue(title);

    await page.getByLabel(/^Team/).fill("Engineering");
    await page.getByLabel(/^Summary/).fill("Help us keep client software reliable with thoughtful testing.");
    await page.getByLabel(/^About the role/).fill("You'll own quality for client projects.\n\nYou'll work with every engineer on the team.");
    await page.getByLabel(/^What you'd work on/).fill("Design test plans\nAutomate regression tests");
    await page.getByLabel(/^What we're looking for/).fill("Experience testing web applications");
    await page.getByLabel(/^Key skills/).fill("Playwright, Test planning");
    await page.getByRole("button", { name: "Post role" }).click();
    // Generous wait: saving revalidates the careers pages, which is slow while the parallel suite loads the machine.
    await expect(page).toHaveURL(/\/admin\/roles\?saved=/, { timeout: 15_000 });
    const slug = decodeURIComponent(new URL(page.url()).searchParams.get("saved")!);
    expect(slug).toMatch(/^qa-analyst-/);
    const card = page.getByRole("listitem").filter({ hasText: title });
    await expect(card).toContainText("Open — accepting applications");

    // Public site: listed, own page, selectable in the application form.
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await page.goto(`/careers/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByText("Automate regression tests")).toBeVisible();
    await expect(page.getByText("Remote — worldwide (outside the United States)").first()).toBeVisible();
    await page.goto(`/careers/apply?role=${slug}`);
    await expect(page.locator('select[name="role"]')).toHaveValue(slug);

    const payload = {
      name: "Role Flow Candidate",
      email: "flow@example.com",
      phone: "+44 20 7946 0958",
      city: "London",
      country: "GB",
      role: slug,
      linkedinUrl: "https://www.linkedin.com/in/flow",
      videoUrl: "https://www.loom.com/share/flow",
      resume: { name: "cv.pdf", data: Buffer.from("%PDF-1.4\n%%EOF\n").toString("base64") },
      consent: true,
    };
    expect(await (await request.post("/api/apply", { data: { payload, website: "", elapsedMs: 9000 } })).json()).toEqual({ status: "sent" });

    // Withdraw: page stays up with a notice, no Apply button; gone from the list and the form; applications refused.
    await page.goto("/admin/roles");
    await page.getByRole("listitem").filter({ hasText: title }).getByRole("button", { name: "Withdraw" }).click();
    await expect(page.getByRole("listitem").filter({ hasText: title })).toContainText("Withdrawn");
    await page.goto(`/careers/${slug}`);
    await expect(page.getByText("This role is no longer accepting applications.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Apply/ })).toHaveCount(0);
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
    await page.goto("/careers/apply");
    await expect(page.locator(`select[name="role"] option[value="${slug}"]`)).toHaveCount(0);
    const refused = await request.post("/api/apply", { data: { payload: { ...payload, name: "Too Late" }, website: "", elapsedMs: 9000 } });
    expect(refused.status()).toBe(422);
    expect((await refused.json()).fieldErrors.role).toMatch(/no longer accepting/);

    // Re-open and edit: back on the site with the new wording, same address.
    await page.goto("/admin/roles");
    await page.getByRole("listitem").filter({ hasText: title }).getByRole("button", { name: "Re-open" }).click();
    await page.getByRole("listitem").filter({ hasText: title }).getByRole("link", { name: "Edit" }).click();
    await page.getByLabel(/^Summary/).fill("Updated summary: help us keep client software reliable.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(new RegExp(`saved=${slug}`));
    await page.goto(`/careers/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title }).locator("xpath=following-sibling::p[1]")).toHaveText(
      "Updated summary: help us keep client software reliable.",
    );
    await expect(page.getByRole("link", { name: "Apply Now" })).toBeVisible();

    // The applicant shows up under the role.
    await page.goto(`/admin/candidates?role=${slug}`);
    await expect(page.getByRole("row", { name: /Role Flow Candidate/ })).toBeVisible();
  });
});
