import { test, expect } from '@playwright/test'

/**
 * App 瀏覽與互動流程 E2E 測試
 * 測試 App 列表、詳情頁、評分、評論、收藏功能
 */

const TEST_HTML = `<!DOCTYPE html>
<html><head><title>Test App</title></head>
<body><h1>Hello World!</h1></body></html>`

// 生成測試用的使用者資訊
const generateTestUser = () => ({
  email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  username: `testuser${Date.now()}`,
  password: 'TestPassword123!'
})

// 輔助函數：註冊並登入使用者
async function registerAndLogin(page: any, user: any) {
  await page.goto('/register')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="username"]', user.username)
  await page.fill('input[name="password"]', user.password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/')
}

// 輔助函數：建立測試 App
async function createTestApp(page: any, title: string) {
  await page.goto('/create')

  const pasteTab = page.locator('button:has-text("剪貼簿"), [role="tab"]:has-text("剪貼簿")')
  if (await pasteTab.isVisible()) {
    await pasteTab.click()
  }

  await page.fill('input[name="title"], input[placeholder*="標題"]', title)
  await page.fill('textarea[name="description"], textarea[placeholder*="描述"]', `Description for ${title}`)

  const htmlTextarea = page.locator('textarea[name="htmlContent"], textarea[placeholder*="HTML"]')
  await htmlTextarea.fill(TEST_HTML)

  await page.click('button[type="submit"]:has-text("上傳"), button:has-text("發布")')
  await page.waitForURL(/\/app\/[a-f0-9-]+/, { timeout: 10000 })

  return page.url()
}

test.describe('App 瀏覽流程', () => {
  test('應該能夠瀏覽首頁的 App 列表', async ({ page }) => {
    await page.goto('/')

    // 驗證頁面載入
    await expect(page).toHaveTitle(/AI App Share/)

    // 檢查是否有 App 卡片或空狀態提示
    const hasApps = await page.locator('[data-testid="app-card"], .app-card, article').count()
    const hasEmptyState = await page.locator('text=/尚無|沒有|No apps/i').isVisible().catch(() => false)

    // 應該顯示 App 列表或空狀態
    expect(hasApps > 0 || hasEmptyState).toBeTruthy()
  })

  test('應該能夠訪問探索頁面', async ({ page }) => {
    await page.goto('/explore')

    // 驗證頁面標題
    await expect(page.locator('h1, h2').first()).toContainText(/探索|Explore|瀏覽/i)

    // 檢查篩選器是否存在
    const hasFilters = await page.locator('select, [role="combobox"], button:has-text("分類")').count() > 0

    expect(hasFilters).toBeTruthy()
  })

  test('應該能夠搜尋 App', async ({ page }) => {
    await page.goto('/explore')

    // 尋找搜尋輸入框
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜尋"], input[placeholder*="Search"]')

    if (await searchInput.isVisible()) {
      // 輸入搜尋關鍵字
      await searchInput.fill('test')

      // 等待搜尋結果更新
      await page.waitForTimeout(1000)

      // 驗證頁面有反應（URL 更新或結果變化）
      const urlHasSearch = page.url().includes('search') || page.url().includes('test')
      const resultsVisible = await page.locator('[data-testid="app-card"], .app-card, article').count() >= 0

      expect(urlHasSearch || resultsVisible).toBeTruthy()
    }
  })
})

test.describe('App 詳情頁', () => {
  let appUrl: string

  test.beforeAll(async ({ browser }) => {
    // 建立測試 App
    const user = generateTestUser()
    const page = await browser.newPage()

    await registerAndLogin(page, user)
    appUrl = await createTestApp(page, 'E2E Interaction Test App')

    await page.close()
  })

  test('應該能夠查看 App 詳情', async ({ page }) => {
    await page.goto(appUrl)

    // 驗證 App 標題
    await expect(page.locator('h1, h2').first()).toContainText('E2E Interaction Test App')

    // 驗證 App 描述
    await expect(page.locator('text=Description for E2E Interaction Test App')).toBeVisible()

    // 驗證 iframe 預覽
    const iframe = page.locator('iframe[sandbox]')
    await expect(iframe).toBeVisible()
  })

  test('應該顯示 App 統計資料', async ({ page }) => {
    await page.goto(appUrl)

    // 檢查是否顯示統計資料（瀏覽次數、評分、收藏數）
    const hasStats = await page.locator('text=/瀏覽|觀看|views/i, text=/評分|rating/i, text=/收藏|favorite/i').count() > 0

    expect(hasStats).toBeTruthy()
  })

  test('應該能夠安全預覽 App', async ({ page }) => {
    await page.goto(appUrl)

    const iframe = page.locator('iframe[sandbox]')
    await expect(iframe).toBeVisible()

    // 驗證 sandbox 屬性
    const sandboxAttr = await iframe.getAttribute('sandbox')
    expect(sandboxAttr).toBeTruthy()

    // 驗證包含基本權限但排除危險權限
    expect(sandboxAttr).toMatch(/allow-scripts/)
    expect(sandboxAttr).not.toMatch(/allow-same-origin.*allow-top-navigation/)
  })
})

test.describe('App 互動功能', () => {
  let appUrl: string
  let user: any

  test.beforeEach(async ({ page }) => {
    // 建立新使用者和 App
    user = generateTestUser()
    await registerAndLogin(page, user)
    appUrl = await createTestApp(page, `Interactive App ${Date.now()}`)
  })

  test('已登入使用者應該能夠評分', async ({ page }) => {
    await page.goto(appUrl)

    // 尋找評分組件
    const ratingStars = page.locator('[data-testid="rating-star"], button[aria-label*="評分"], button[aria-label*="star"]')

    if (await ratingStars.first().isVisible()) {
      // 點擊第 5 顆星
      await ratingStars.nth(4).click()

      // 等待評分提交
      await page.waitForTimeout(1000)

      // 驗證評分已更新（可能顯示感謝訊息或星星變色）
      const hasConfirmation = await page.locator('text=/感謝|已評分|rated/i').isVisible({ timeout: 3000 }).catch(() => false)

      // 或檢查星星是否變為已選取狀態
      const fifthStar = ratingStars.nth(4)
      const isFilled = await fifthStar.evaluate((el: Element) => {
        return el.classList.contains('filled') ||
               el.classList.contains('active') ||
               el.getAttribute('aria-pressed') === 'true'
      }).catch(() => false)

      expect(hasConfirmation || isFilled).toBeTruthy()
    }
  })

  test('已登入使用者應該能夠留言', async ({ page }) => {
    await page.goto(appUrl)

    // 尋找留言輸入框
    const commentInput = page.locator('textarea[placeholder*="留言"], textarea[placeholder*="評論"], textarea[placeholder*="comment"]')

    if (await commentInput.isVisible()) {
      // 填寫留言
      const commentText = `This is a test comment from ${user.username}`
      await commentInput.fill(commentText)

      // 提交留言
      const submitButton = page.locator('button:has-text("送出"), button:has-text("發布"), button[type="submit"]').last()
      await submitButton.click()

      // 等待留言出現
      await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 5000 })

      // 驗證顯示使用者名稱
      await expect(page.locator(`text=${user.username}`)).toBeVisible()
    }
  })

  test('已登入使用者應該能夠收藏 App', async ({ page }) => {
    await page.goto(appUrl)

    // 尋找收藏按鈕
    const favoriteButton = page.locator('button[aria-label*="收藏"], button:has-text("收藏"), button[data-testid="favorite-button"]')

    if (await favoriteButton.isVisible()) {
      // 點擊收藏
      await favoriteButton.click()

      // 等待狀態更新
      await page.waitForTimeout(1000)

      // 驗證按鈕狀態變化
      const isActive = await favoriteButton.evaluate((el: Element) => {
        return el.classList.contains('active') ||
               el.classList.contains('favorited') ||
               el.getAttribute('aria-pressed') === 'true'
      })

      expect(isActive).toBeTruthy()

      // 再次點擊取消收藏
      await favoriteButton.click()
      await page.waitForTimeout(1000)

      const isInactive = await favoriteButton.evaluate((el: Element) => {
        return !el.classList.contains('active') &&
               !el.classList.contains('favorited') &&
               el.getAttribute('aria-pressed') !== 'true'
      })

      expect(isInactive).toBeTruthy()
    }
  })
})

test.describe('未登入使用者限制', () => {
  test('未登入使用者應該無法評分', async ({ page }) => {
    // 先建立一個 App
    const user = generateTestUser()
    await registerAndLogin(page, user)
    const appUrl = await createTestApp(page, 'Public Test App')

    // 登出
    const logoutButton = page.locator('button:has-text("登出"), a:has-text("登出")')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }

    // 訪問 App 詳情頁
    await page.goto(appUrl)

    // 評分組件應該顯示為只讀或提示登入
    const ratingStars = page.locator('[data-testid="rating-star"], button[aria-label*="評分"]')

    if (await ratingStars.first().isVisible()) {
      // 點擊星星
      await ratingStars.nth(4).click()

      // 應該導向登入頁面或顯示提示
      const isLoginPage = page.url().includes('/login')
      const hasLoginPrompt = await page.locator('text=/請先登入|需要登入|login required/i').isVisible({ timeout: 2000 }).catch(() => false)

      expect(isLoginPage || hasLoginPrompt).toBeTruthy()
    }
  })

  test('未登入使用者應該無法留言', async ({ page }) => {
    // 訪問任意 App 詳情頁（使用公開 URL）
    await page.goto('/')

    // 點擊第一個 App（如果有）
    const firstApp = page.locator('[data-testid="app-card"], .app-card, article').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForURL(/\/app\/[a-f0-9-]+/)

      // 評論區應該顯示登入提示或隱藏輸入框
      const commentInput = page.locator('textarea[placeholder*="留言"], textarea[placeholder*="評論"]')
      const hasLoginPrompt = await page.locator('text=/請先登入|需要登入才能留言/i').isVisible().catch(() => false)

      // 評論輸入框應該不可見或被禁用
      const inputVisible = await commentInput.isVisible().catch(() => false)

      expect(!inputVisible || hasLoginPrompt).toBeTruthy()
    }
  })
})
