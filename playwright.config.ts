import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests for Almanac. Run against the local dev server by default;
 * override with `BASE_URL=https://almanac-7hco.onrender.com npx playwright test`.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:4321",
    trace: "off",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
