import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Runs against a production build. The inquiry endpoint is deliberately left
  // unconfigured (no RESEND_API_KEY) so the tests exercise the safe "not configured" path.
  webServer: {
    command: `npm run start -- --port ${port} --hostname 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { RESEND_API_KEY: "", INQUIRY_TO_EMAIL: "", HUBSPOT_ACCESS_TOKEN: "", INQUIRY_RATE_LIMIT_MAX: "100" },
  },
});
