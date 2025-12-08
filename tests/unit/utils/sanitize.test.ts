import { describe, it, expect } from 'vitest'
import {
  sanitizeText,
  sanitizeUrl,
  sanitizeMarkdown,
  sanitizeFilename,
  sanitizeObject
} from '~/server/utils/sanitize'

describe('Sanitize Utils', () => {
  describe('sanitizeText', () => {
    it('應該移除 HTML 標籤', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeText(input)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
      expect(result).toContain('Hello')
    })

    it('應該移除事件處理器', () => {
      const input = '<div onclick="alert(1)">Click me</div>'
      const result = sanitizeText(input)
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('alert')
    })

    it('應該移除 javascript: 協議', () => {
      const input = '<a href="javascript:alert(1)">Link</a>'
      const result = sanitizeText(input)
      expect(result).not.toContain('javascript:')
    })

    it('應該轉換特殊字元', () => {
      const input = '<div>"test" & \'quote\'</div>'
      const result = sanitizeText(input)
      expect(result).toContain('&quot;')
      expect(result).toContain('&amp;')
      expect(result).toContain('&#x27;')
    })

    it('應該處理空字串', () => {
      expect(sanitizeText('')).toBe('')
      expect(sanitizeText(null as any)).toBe('')
      expect(sanitizeText(undefined as any)).toBe('')
    })

    it('應該限制長度', () => {
      const input = 'a'.repeat(20000)
      const result = sanitizeText(input)
      expect(result.length).toBeLessThanOrEqual(10000)
    })
  })

  describe('sanitizeUrl', () => {
    it('應該允許 https URL', () => {
      const input = 'https://example.com/path'
      const result = sanitizeUrl(input)
      expect(result).toBe(input)
    })

    it('應該允許 http URL', () => {
      const input = 'http://example.com/path'
      const result = sanitizeUrl(input)
      expect(result).toBe(input)
    })

    it('應該拒絕 javascript: 協議', () => {
      const input = 'javascript:alert(1)'
      const result = sanitizeUrl(input)
      expect(result).toBe('')
    })

    it('應該拒絕 data: 協議', () => {
      const input = 'data:text/html,<script>alert(1)</script>'
      const result = sanitizeUrl(input)
      expect(result).toBe('')
    })

    it('應該拒絕無協議的 URL', () => {
      const input = 'example.com'
      const result = sanitizeUrl(input)
      expect(result).toBe('')
    })

    it('應該限制長度', () => {
      const input = 'https://example.com/' + 'a'.repeat(5000)
      const result = sanitizeUrl(input)
      expect(result.length).toBeLessThanOrEqual(2000)
    })
  })

  describe('sanitizeMarkdown', () => {
    it('應該移除 script 標籤', () => {
      const input = '# Title\n<script>alert(1)</script>\nContent'
      const result = sanitizeMarkdown(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('# Title')
    })

    it('應該移除 iframe', () => {
      const input = '# Title\n<iframe src="evil.com"></iframe>'
      const result = sanitizeMarkdown(input)
      expect(result).not.toContain('<iframe>')
    })

    it('應該移除事件處理器', () => {
      const input = '<img src="x" onerror="alert(1)">'
      const result = sanitizeMarkdown(input)
      expect(result).not.toContain('onerror')
    })

    it('應該保留基本的 markdown', () => {
      const input = '# Title\n\n**Bold** and *italic*'
      const result = sanitizeMarkdown(input)
      expect(result).toContain('# Title')
      expect(result).toContain('**Bold**')
    })
  })

  describe('sanitizeFilename', () => {
    it('應該移除路徑遍歷', () => {
      const input = '../../etc/passwd'
      const result = sanitizeFilename(input)
      expect(result).not.toContain('..')
      expect(result).not.toContain('/')
    })

    it('應該移除特殊字元', () => {
      const input = 'file<>:"|?*.txt'
      const result = sanitizeFilename(input)
      expect(result).toMatch(/^[a-zA-Z0-9._-]+$/)
    })

    it('應該保留合法字元', () => {
      const input = 'my-file_v1.2.txt'
      const result = sanitizeFilename(input)
      expect(result).toBe(input)
    })

    it('應該限制長度', () => {
      const input = 'a'.repeat(500) + '.txt'
      const result = sanitizeFilename(input)
      expect(result.length).toBeLessThanOrEqual(255)
    })
  })

  describe('sanitizeObject', () => {
    it('應該清理指定欄位', () => {
      const input = {
        name: '<script>alert(1)</script>John',
        age: 25,
        bio: '<div onclick="evil()">Bio</div>'
      }
      const result = sanitizeObject(input, ['name', 'bio'])
      expect(result.name).not.toContain('<script>')
      expect(result.bio).not.toContain('onclick')
      expect(result.age).toBe(25)
    })

    it('應該跳過非字串欄位', () => {
      const input = {
        name: 'John',
        age: 25,
        active: true
      }
      const result = sanitizeObject(input, ['name', 'age', 'active'])
      expect(result.age).toBe(25)
      expect(result.active).toBe(true)
    })
  })
})
