import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { setupH3Mocks, createMockEvent } from '../../../helpers/h3Mocks'
import { query } from '~/server/utils/db'
import { uploadToS3 } from '~/server/utils/s3'
import AdmZip from 'adm-zip'

// 設置 H3 mocks
setupH3Mocks()

// Mock dependencies
vi.mock('~/server/utils/db')
vi.mock('~/server/utils/s3')

// 動態導入處理器（在 mocks 設置之後）
let handler: any

beforeAll(async () => {
  handler = (await import('~/server/api/apps/index.post')).default
})

describe('POST /api/apps - ZIP 上傳', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock uploadToS3
    vi.mocked(uploadToS3).mockImplementation(async (key: string) => {
      return `https://s3.tebi.io/ai-app-share/${key}`
    })

    // Mock query
    vi.mocked(query).mockResolvedValue({
      rows: [{
        id: 'test-uuid',
        user_id: 'user-123',
        title: 'Test ZIP App',
        description: 'A test app from ZIP',
        category: 'tool',
        tags: ['test'],
        upload_type: 'zip',
        html_s3_key: 'apps/test-uuid/index.html',
        file_manifest: {
          'index.html': 'apps/test-uuid/index.html',
          'style.css': 'apps/test-uuid/style.css',
          'js/script.js': 'apps/test-uuid/js/script.js'
        },
        created_at: new Date(),
        updated_at: new Date()
      }]
    } as any)
  })

  it('應該成功上傳 ZIP 檔案', async () => {
    // 建立測試 ZIP
    const zip = new AdmZip()
    zip.addFile('index.html', Buffer.from('<html><body>Test App</body></html>'))
    zip.addFile('style.css', Buffer.from('body { margin: 0; }'))
    zip.addFile('js/script.js', Buffer.from('console.log("test")'))
    const zipBuffer = zip.toBuffer()

    const event = createMockEvent({
      body: {
        uploadType: 'zip',
        title: 'Test ZIP App',
        description: 'A test app from ZIP',
        category: 'tool',
        tags: ['test'],
        zipContent: zipBuffer.toString('base64')
      },
      context: { userId: 'user-123' }
    })

    const response = await handler(event)

    // 驗證回應
    expect(response).toHaveProperty('app')
    expect(response).toHaveProperty('urls')
    expect(response.app.title).toBe('Test ZIP App')
    expect(response.app.upload_type).toBe('zip')

    // 驗證 uploadToS3 被呼叫 3 次（3 個檔案）
    expect(uploadToS3).toHaveBeenCalledTimes(3)
    
    // 驗證主 HTML 檔案被上傳
    expect(uploadToS3).toHaveBeenCalledWith(
      expect.stringContaining('/index.html'),
      expect.any(Buffer),
      'text/html',
      expect.any(Object)
    )

    // 驗證 CSS 檔案被上傳
    expect(uploadToS3).toHaveBeenCalledWith(
      expect.stringContaining('/style.css'),
      expect.any(Buffer),
      'text/css',
      expect.any(Object)
    )

    // 驗證 JS 檔案被上傳
    expect(uploadToS3).toHaveBeenCalledWith(
      expect.stringContaining('/js/script.js'),
      expect.any(Buffer),
      'application/javascript',
      expect.any(Object)
    )
  })

  it('應該正確設定 file_manifest', async () => {
    const zip = new AdmZip()
    zip.addFile('index.html', Buffer.from('<html>Test</html>'))
    zip.addFile('style.css', Buffer.from('body {}'))
    const zipBuffer = zip.toBuffer()

    const event = createMockEvent({
      body: {
        uploadType: 'zip',
        title: 'Test App',
        zipContent: zipBuffer.toString('base64')
      },
      context: { userId: 'user-123' }
    })

    await handler(event)

    // 檢查 query 被呼叫時的參數
    const queryCall = vi.mocked(query).mock.calls[0]
    const fileManifestJson = queryCall[1][8] // file_manifest 參數（JSON 字串）

    // 解析 JSON 字串
    expect(typeof fileManifestJson).toBe('string')
    const fileManifest = JSON.parse(fileManifestJson)

    expect(fileManifest).toHaveProperty('index.html')
    expect(fileManifest).toHaveProperty('style.css')
    expect(fileManifest['index.html']).toContain('index.html')
    expect(fileManifest['style.css']).toContain('style.css')
  })

  it('應該自動偵測主 HTML 檔案', async () => {
    const zip = new AdmZip()
    zip.addFile('style.css', Buffer.from('body {}'))
    zip.addFile('main.html', Buffer.from('<html>Main</html>'))
    const zipBuffer = zip.toBuffer()

    const event = createMockEvent({
      body: {
        uploadType: 'zip',
        title: 'Test App',
        zipContent: zipBuffer.toString('base64')
      },
      context: { userId: 'user-123' }
    })

    await handler(event)

    // 檢查 html_s3_key 應該指向 main.html
    const queryCall = vi.mocked(query).mock.calls[0]
    const htmlS3Key = queryCall[1][7] // html_s3_key 參數

    expect(htmlS3Key).toContain('main.html')
  })

  it('應該拒絕沒有 HTML 檔案的 ZIP', async () => {
    const zip = new AdmZip()
    zip.addFile('style.css', Buffer.from('body {}'))
    zip.addFile('script.js', Buffer.from('console.log("test")'))
    const zipBuffer = zip.toBuffer()

    const event = createMockEvent({
      body: {
        uploadType: 'zip',
        title: 'Test App',
        zipContent: zipBuffer.toString('base64')
      },
      context: { userId: 'user-123' }
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('HTML')
    })
  })

  it('應該保持目錄結構', async () => {
    const zip = new AdmZip()
    zip.addFile('index.html', Buffer.from('<html>Test</html>'))
    zip.addFile('css/main.css', Buffer.from('body {}'))
    zip.addFile('js/lib/helper.js', Buffer.from('console.log("helper")'))
    const zipBuffer = zip.toBuffer()

    const event = createMockEvent({
      body: {
        uploadType: 'zip',
        title: 'Test App',
        zipContent: zipBuffer.toString('base64')
      },
      context: { userId: 'user-123' }
    })

    await handler(event)

    // 驗證目錄結構被保留
    expect(uploadToS3).toHaveBeenCalledWith(
      expect.stringContaining('/css/main.css'),
      expect.any(Buffer),
      'text/css',
      expect.any(Object)
    )

    expect(uploadToS3).toHaveBeenCalledWith(
      expect.stringContaining('/js/lib/helper.js'),
      expect.any(Buffer),
      'application/javascript',
      expect.any(Object)
    )
  })

  it('應該拒絕無效的 base64 內容', async () => {
    const event = createMockEvent({
      body: {
        uploadType: 'zip',
        title: 'Test App',
        zipContent: 'invalid-base64!!!'
      },
      context: { userId: 'user-123' }
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該拒絕空的 ZIP 檔案', async () => {
    const zip = new AdmZip()
    const zipBuffer = zip.toBuffer()

    const event = createMockEvent({
      body: {
        uploadType: 'zip',
        title: 'Test App',
        zipContent: zipBuffer.toString('base64')
      },
      context: { userId: 'user-123' }
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })
})
