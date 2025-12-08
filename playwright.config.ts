import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 測試配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // 測試超時時間
  timeout: 30 * 1000,

  // 期望超時時間
  expect: {
    timeout: 5000
  },

  // 失敗時重試次數（僅在 CI 環境）
  retries: process.env.CI ? 2 : 0,

  // 並行執行的 worker 數量
  workers: process.env.CI ? 1 : undefined,

  // 測試報告
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // 共用設定
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // 追蹤設定（僅在失敗時保留）
    trace: 'on-first-retry',

    // 截圖設定
    screenshot: 'only-on-failure',

    // 視頻設定
    video: 'retain-on-failure',
  },

  // 配置不同的瀏覽器
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 可選：其他瀏覽器
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 測試前啟動開發伺服器
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
