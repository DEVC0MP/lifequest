import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173",
    trace: "on-first-retry"
  },
  webServer: process.env.PLAYWRIGHT_EXTERNAL_SERVER
    ? undefined
    : {
        command: "npm run preview",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
