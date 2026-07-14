import { defineConfig, devices } from '@playwright/test';

/**
 * The backend is not live in this scaffold. Every spec under e2e/ stubs the
 * `/api/v1/**` routes with `page.route(...)` using the shared fixtures in
 * src/tests/fixtures.ts, so these tests exercise only the frontend + a
 * scripted network layer (no real ASP.NET Core process required).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
