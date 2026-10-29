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
  // Runs against a production build. Email is deliberately disabled (no SMTP or Resend credentials, even if
  // .env.local has them) so tests never send real mail; submissions are saved to a throwaway test-results folder,
  // which is how the real site receives them when email isn't configured.
  webServer: {
    command: `npm run start -- --port ${port} --hostname 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      SMTP_HOST: "",
      SMTP_USER: "",
      SMTP_PASSWORD: "",
      RESEND_API_KEY: "",
      EMAIL_FROM: "",
      HUBSPOT_ACCESS_TOKEN: "",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
      KV_REST_API_URL: "",
      KV_REST_API_TOKEN: "",
      SUBMISSIONS_DIR: "test-results/e2e-submissions",
      INTAKE_RATE_LIMIT_MAX: "200",
    },
  },
});
