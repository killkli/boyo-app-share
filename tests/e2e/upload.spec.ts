import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 上傳流程 E2E 測試
 * 測試剪貼簿上傳、檔案上傳功能
 */

// 測試用的 HTML 內容
const TEST_HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test App</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello from E2E Test!</h1>
    <p>This is a test application</p>
  </div>
</body>
</html>`

// 生成測試用的使用者資訊
const generateTestUser = () => ({
  email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  username: `testuser${Date.now()}`,
  password: 'TestPassword123!'
})

test.describe('App 上傳流程', () => {
  // 每個測試前都先登入
  test.beforeEach(async ({ page }) => {
    const user = generateTestUser()

    // 註冊並登入
    await page.goto('/register')
    await page.fill('input[name="email"]', user.email)
    await page.fill('input[name="username"]', user.username)
    await page.fill('input[name="password"]', user.password)
    await page.click('button[type="submit"]')

    // 等待登入成功
    await expect(page).toHaveURL('/')
  })

  test('應該能夠使用剪貼簿上傳 HTML', async ({ page }) => {
    // 前往上傳頁面
    await page.goto('/create')

    // 驗證頁面標題
    await expect(page.locator('h1, h2').first()).toContainText(/上傳|建立|Create/i)

    // 選擇剪貼簿上傳方式
    const pasteTab = page.locator('button:has-text("剪貼簿"), [role="tab"]:has-text("剪貼簿")')
    if (await pasteTab.isVisible()) {
      await pasteTab.click()
    }

    // 填寫 App 資訊
    await page.fill('input[name="title"], input[placeholder*="標題"]', 'E2E Test App')
    await page.fill('textarea[name="description"], textarea[placeholder*="描述"]', 'This is a test app created by E2E test')

    // 選擇分類
    const categorySelect = page.locator('select[name="category"], button:has-text("選擇分類")')
    if (await categorySelect.first().isVisible()) {
      const isNativeSelect = await categorySelect.first().evaluate(el => el.tagName === 'SELECT')
      if (isNativeSelect) {
        await categorySelect.first().selectOption('tool')
      } else {
        // shadcn-vue Select 組件
        await categorySelect.first().click()
        await page.click('[role="option"]:has-text("工具"), [role="option"]:has-text("Tool")')
      }
    }

    // 填寫 HTML 內容
    const htmlTextarea = page.locator('textarea[name="htmlContent"], textarea[placeholder*="HTML"]')
    await htmlTextarea.fill(TEST_HTML)

    // 驗證預覽顯示
    const preview = page.locator('iframe[sandbox]')
    if (await preview.isVisible()) {
      // 等待 iframe 載入
      await page.waitForTimeout(1000)

      // 驗證 iframe 內容
      const frame = preview.frameLocator('html')
      await expect(frame.locator('h1')).toContainText('Hello from E2E Test!')
    }

    // 提交表單
    await page.click('button[type="submit"]:has-text("上傳"), button:has-text("發布")')

    // 等待上傳完成並導向 App 詳情頁
    await page.waitForURL(/\/app\/[a-f0-9-]+/, { timeout: 10000 })

    // 驗證 App 詳情頁顯示正確
    await expect(page.locator('h1, h2').first()).toContainText('E2E Test App')
    await expect(page.locator('text=This is a test app created by E2E test')).toBeVisible()
  })

  test('應該驗證必填欄位', async ({ page }) => {
    await page.goto('/create')

    // 不填寫任何資訊，直接提交
    const submitButton = page.locator('button[type="submit"]:has-text("上傳"), button:has-text("發布")')
    await submitButton.click()

    // 應該顯示驗證錯誤或停留在當前頁面
    await expect(page).toHaveURL(/\/create/)

    // 檢查是否有錯誤訊息
    const hasError = await page.locator('text=/必填|required|不能為空/i').isVisible().catch(() => false)

    // 或檢查 HTML5 validation
    const titleInput = page.locator('input[name="title"], input[placeholder*="標題"]')
    const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => !el.validity.valid)

    expect(hasError || isInvalid).toBeTruthy()
  })

  test('應該能夠在上傳前取消', async ({ page }) => {
    await page.goto('/create')

    // 填寫部分資訊
    await page.fill('input[name="title"], input[placeholder*="標題"]', 'Cancelled App')

    // 點擊取消或返回按鈕
    const cancelButton = page.locator('button:has-text("取消"), a:has-text("取消"), a[href="/"]')
    if (await cancelButton.first().isVisible()) {
      await cancelButton.first().click()

      // 應該導向首頁
      await expect(page).toHaveURL('/')
    } else {
      // 如果沒有取消按鈕，使用瀏覽器返回
      await page.goBack()
      await expect(page).toHaveURL('/')
    }
  })
})

test.describe('檔案上傳流程', () => {
  test.beforeEach(async ({ page }) => {
    const user = generateTestUser()

    // 註冊並登入
    await page.goto('/register')
    await page.fill('input[name="email"]', user.email)
    await page.fill('input[name="username"]', user.username)
    await page.fill('input[name="password"]', user.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/')
  })

  test('應該能夠上傳 HTML 檔案', async ({ page }) => {
    await page.goto('/create')

    // 選擇檔案上傳方式
    const fileTab = page.locator('button:has-text("檔案上傳"), [role="tab"]:has-text("檔案")')
    if (await fileTab.isVisible()) {
      await fileTab.click()
    }

    // 填寫 App 資訊
    await page.fill('input[name="title"], input[placeholder*="標題"]', 'File Upload Test')
    await page.fill('textarea[name="description"], textarea[placeholder*="描述"]', 'Test file upload')

    // 建立臨時測試檔案
    const fs = require('fs')
    const os = require('os')
    const tmpDir = os.tmpdir()
    const testFilePath = path.join(tmpDir, 'test-app.html')
    fs.writeFileSync(testFilePath, TEST_HTML)

    // 上傳檔案
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testFilePath)

    // 等待檔案載入
    await page.waitForTimeout(500)

    // 提交表單
    await page.click('button[type="submit"]:has-text("上傳"), button:has-text("發布")')

    // 等待上傳完成
    await page.waitForURL(/\/app\/[a-f0-9-]+/, { timeout: 10000 })

    // 驗證 App 詳情頁
    await expect(page.locator('h1, h2').first()).toContainText('File Upload Test')

    // 清理測試檔案
    fs.unlinkSync(testFilePath)
  })

  test('應該只接受 HTML 或 ZIP 檔案', async ({ page }) => {
    await page.goto('/create')

    // 選擇檔案上傳方式
    const fileTab = page.locator('button:has-text("檔案上傳"), [role="tab"]:has-text("檔案")')
    if (await fileTab.isVisible()) {
      await fileTab.click()
    }

    // 檢查 file input 的 accept 屬性
    const fileInput = page.locator('input[type="file"]')
    const acceptAttr = await fileInput.getAttribute('accept')

    // 應該限制檔案類型
    expect(acceptAttr).toMatch(/\.html|\.zip|text\/html|application\/zip/)
  })
})
