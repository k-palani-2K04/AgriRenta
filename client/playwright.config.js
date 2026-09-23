import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    screenshot: 'only-on-failure',
    // video disabled — ffmpeg not available in this environment
    video: 'off',
    actionTimeout: 10000,
    navigationTimeout: 20000,
    // Use system-installed Chrome (no CDN download needed)
    channel: 'chrome',
  },

  timeout: 30000,

  projects: [
    /* ── Desktop Chrome (1280 × 800) ── */
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
      },
    },

    /* ── Mobile Chrome (375 × 812 — Pixel 5 emulation) ── */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        channel: 'chrome',
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
      },
    },
  ],
});
