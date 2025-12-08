import { test, expect } from '@playwright/test'

/**
 * 認證流程 E2E 測試
 * 測試使用者註冊、登入、登出的完整流程
 */

// 使用隨機 email 避免測試衝突
const generateTestEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`

test.describe('使用者認證流程', () => {
  test('應該能夠成功註冊新帳號', async ({ page }) => {
    const email = generateTestEmail()
    const username = `testuser${Date.now()}`
    const password = 'TestPassword123!'

    // 訪問註冊頁面
    await page.goto('/register')

    // 驗證頁面標題
    await expect(page).toHaveTitle(/AI App Share/)

    // 填寫註冊表單
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="password"]', password)

    // 提交表單
    await page.click('button[type="submit"]')

    // 驗證註冊成功 - 應該導向首頁
    await expect(page).toHaveURL('/')

    // 驗證已登入狀態 - 應該顯示使用者名稱
    await expect(page.locator('text=' + username)).toBeVisible()
  })

  test('應該拒絕無效的 email 格式', async ({ page }) => {
    await page.goto('/register')

    // 填寫無效的 email
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'TestPassword123!')

    // 提交表單
    await page.click('button[type="submit"]')

    // 應該顯示錯誤訊息（HTML5 validation 或自定義錯誤）
    const emailInput = page.locator('input[name="email"]')
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)

    // 驗證有錯誤訊息
    expect(validationMessage).toBeTruthy()
  })

  test('應該拒絕過短的密碼', async ({ page }) => {
    await page.goto('/register')

    const email = generateTestEmail()

    // 填寫過短的密碼
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', '123')

    // 提交表單
    await page.click('button[type="submit"]')

    // 應該顯示錯誤訊息
    await expect(page.locator('text=/密碼至少.*個字元/i')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('使用者登入流程', () => {
  let testEmail: string
  let testUsername: string
  const testPassword = 'TestPassword123!'

  // 在所有登入測試前先建立一個測試帳號
  test.beforeAll(async ({ browser }) => {
    testEmail = generateTestEmail()
    testUsername = `testuser${Date.now()}`

    const page = await browser.newPage()
    await page.goto('/register')

    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="username"]', testUsername)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')

    // 等待註冊完成
    await page.waitForURL('/')

    // 登出
    await page.click('button:has-text("登出"), a:has-text("登出")')
    await page.close()
  })

  test('應該能夠使用正確的帳號密碼登入', async ({ page }) => {
    await page.goto('/login')

    // 填寫登入表單
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)

    // 提交表單
    await page.click('button[type="submit"]')

    // 驗證登入成功
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=' + testUsername)).toBeVisible()
  })

  test('應該拒絕錯誤的密碼', async ({ page }) => {
    await page.goto('/login')

    // 填寫錯誤的密碼
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'WrongPassword!')

    // 提交表單
    await page.click('button[type="submit"]')

    // 應該顯示錯誤訊息
    await expect(page.locator('text=/密碼錯誤|登入失敗|invalid/i')).toBeVisible({ timeout: 5000 })
  })

  test('應該拒絕不存在的帳號', async ({ page }) => {
    await page.goto('/login')

    // 填寫不存在的 email
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', testPassword)

    // 提交表單
    await page.click('button[type="submit"]')

    // 應該顯示錯誤訊息
    await expect(page.locator('text=/帳號不存在|找不到使用者|登入失敗|not found/i')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('登出流程', () => {
  test('已登入使用者應該能夠登出', async ({ page }) => {
    // 先註冊並登入
    const email = generateTestEmail()
    const username = `testuser${Date.now()}`
    const password = 'TestPassword123!'

    await page.goto('/register')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')

    // 等待登入成功
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=' + username)).toBeVisible()

    // 點擊登出按鈕
    await page.click('button:has-text("登出"), a:has-text("登出")')

    // 驗證已登出 - 應該導向登入頁面或首頁且不顯示使用者名稱
    const isLoginPage = page.url().includes('/login')
    const hasUsername = await page.locator('text=' + username).isVisible().catch(() => false)

    expect(isLoginPage || !hasUsername).toBeTruthy()
  })
})
