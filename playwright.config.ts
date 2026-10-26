import { defineConfig } from '@playwright/test'

const baseURL = process.env.APP_URL || 'http://localhost:8443'

// Uses the locally installed Microsoft Edge (channel "msedge"), so no browser download is needed.
// Set PW_CHANNEL=chromium to use Playwright's own browser instead.
export default defineConfig({
  testDir: './tests-ui',
  timeout: 60_000,
  reporter: 'list',
  use: { baseURL, channel: process.env.PW_CHANNEL ?? 'msedge', headless: true },
  webServer: process.env.APP_URL ? undefined : { command: 'pnpm dev', url: baseURL, reuseExistingServer: true, timeout: 60_000 },
})
