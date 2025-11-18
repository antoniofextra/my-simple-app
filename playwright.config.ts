import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Disabled to prevent database conflicts between tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run tests sequentially to avoid database interference
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Temporarily disabled to speed up CI - will re-enable later
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  webServer: [
    {
      command: 'cd backend && pnpm run dev',
      url: 'http://localhost:4000/api/todos',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'cd frontend && pnpm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})

