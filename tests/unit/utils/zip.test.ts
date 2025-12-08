import { describe, it, expect, beforeEach } from 'vitest'
import { extractZip, findMainHtml } from '~/server/utils/zip'
import AdmZip from 'adm-zip'

describe('ZIP 工具函數', () => {
  let testZipBuffer: Buffer

  beforeEach(() => {
    // 建立測試 ZIP 檔案
    const zip = new AdmZip()
    zip.addFile('index.html', Buffer.from('<html>Main</html>'))
    zip.addFile('style.css', Buffer.from('body { margin: 0; }'))
    zip.addFile('js/script.js', Buffer.from('console.log("test")'))
    testZipBuffer = zip.toBuffer()
  })

  it('應該成功解壓 ZIP 檔案', async () => {
    const files = await extractZip(testZipBuffer)

    expect(files).toHaveLength(3)
    expect(files.find(f => f.path === 'index.html')).toBeDefined()
    expect(files.find(f => f.path === 'style.css')).toBeDefined()
    expect(files.find(f => f.path === 'js/script.js')).toBeDefined()
  })

  it('應該正確設定檔案內容', async () => {
    const files = await extractZip(testZipBuffer)
    const indexFile = files.find(f => f.path === 'index.html')

    expect(indexFile).toBeDefined()
    expect(indexFile!.content.toString()).toBe('<html>Main</html>')
  })

  it('應該正確設定檔案大小', async () => {
    const files = await extractZip(testZipBuffer)
    const indexFile = files.find(f => f.path === 'index.html')

    expect(indexFile).toBeDefined()
    expect(indexFile!.size).toBe(17) // '<html>Main</html>'.length
  })

  it('應該正確設定 MIME 類型', async () => {
    const files = await extractZip(testZipBuffer)
    
    const htmlFile = files.find(f => f.path === 'index.html')
    const cssFile = files.find(f => f.path === 'style.css')
    const jsFile = files.find(f => f.path === 'js/script.js')

    expect(htmlFile!.type).toBe('text/html')
    expect(cssFile!.type).toBe('text/css')
    expect(jsFile!.type).toBe('application/javascript')
  })

  it('應該自動偵測主 HTML 檔案', async () => {
    const files = await extractZip(testZipBuffer)
    const mainHtml = findMainHtml(files)

    expect(mainHtml).toBe('index.html')
  })

  it('應該優先選擇根目錄的 index.html', async () => {
    const zip = new AdmZip()
    zip.addFile('index.html', Buffer.from('<html>Root</html>'))
    zip.addFile('folder/index.html', Buffer.from('<html>Sub</html>'))
    const buffer = zip.toBuffer()

    const files = await extractZip(buffer)
    const mainHtml = findMainHtml(files)

    expect(mainHtml).toBe('index.html')
  })

  it('應該在沒有 index.html 時選擇其他 HTML 檔案', async () => {
    const zip = new AdmZip()
    zip.addFile('main.html', Buffer.from('<html>Main</html>'))
    zip.addFile('style.css', Buffer.from('body {}'))
    const buffer = zip.toBuffer()

    const files = await extractZip(buffer)
    const mainHtml = findMainHtml(files)

    expect(mainHtml).toBe('main.html')
  })

  it('應該在沒有 HTML 檔案時返回 null', async () => {
    const zip = new AdmZip()
    zip.addFile('style.css', Buffer.from('body {}'))
    zip.addFile('script.js', Buffer.from('console.log("test")'))
    const buffer = zip.toBuffer()

    const files = await extractZip(buffer)
    const mainHtml = findMainHtml(files)

    expect(mainHtml).toBeNull()
  })

  it('應該排除目錄條目', async () => {
    const zip = new AdmZip()
    zip.addFile('folder/', Buffer.from('')) // 目錄條目
    zip.addFile('index.html', Buffer.from('<html>Test</html>'))
    const buffer = zip.toBuffer()

    const files = await extractZip(buffer)

    // 應該只有檔案，不包含目錄條目
    expect(files.every(f => !f.path.endsWith('/'))).toBe(true)
    expect(files.find(f => f.path === 'index.html')).toBeDefined()
  })
})
