import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e-cms',
  outputDir: './test-results-cms',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-cms' }]],
  use: {
    baseURL: 'http://127.0.0.1:4326',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 800 } } },
  ],
  webServer: {
    command: 'pnpm run dev:cms',
    url: 'http://127.0.0.1:4326/events/cms-sample-screening/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
