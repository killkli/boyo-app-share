import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import { validateSecretStrength, generateToken, verifyToken } from '../jwt'

const STRONG_SECRET = 'XKj9mP2qR7sT4vW8yZ3nL6hF1aB5cE0d'

describe('validateSecretStrength', () => {
  it('應該拒絕短於 32 字元的密鑰', () => {
    expect(() => validateSecretStrength('short')).toThrow('at least 32 characters')
    expect(() => validateSecretStrength('a'.repeat(31))).toThrow('at least 32 characters')
  })

  it('應該拒絕已知預設模式 ai-app-share-jwt-secret-key-2024-change-in-production', () => {
    expect(() =>
      validateSecretStrength('ai-app-share-jwt-secret-key-2024-change-in-production')
    ).toThrow('weak pattern')
  })

  it('應該拒絕已知預設模式 your-super-secret-key-change-in-production', () => {
    expect(() =>
      validateSecretStrength('your-super-secret-key-change-in-production')
    ).toThrow('weak pattern')
  })

  it('應該拒絕包含 "change-me" 的密鑰', () => {
    expect(() =>
      validateSecretStrength('some-long-secret-with-change-me-inside-here')
    ).toThrow('"change-me"')
  })

  it('應該拒絕包含 "your-secret" 的密鑰', () => {
    expect(() =>
      validateSecretStrength('this-is-your-secret-that-is-long-enough-abc')
    ).toThrow('"your-secret"')
  })

  it('應該拒絕包含 "default" 的密鑰', () => {
    expect(() =>
      validateSecretStrength('using-a-default-value-long-enough-abc-def-gh')
    ).toThrow('"default"')
  })

  it('應該拒絕包含 "example" 的密鑰', () => {
    expect(() =>
      validateSecretStrength('this-is-an-example-secret-that-is-long-enough')
    ).toThrow('"example"')
  })

  it('應該接受強密鑰（32+ 字元，無預設模式）', () => {
    expect(() => validateSecretStrength(STRONG_SECRET)).not.toThrow()
    expect(() => validateSecretStrength('a'.repeat(32))).not.toThrow()
  })

  it('應該接受 openssl rand -base64 32 生成的密鑰', () => {
    expect(() => validateSecretStrength('K7mX2pQ9rT4vW8yZ3nL6hF1aB5cE0dJu')).not.toThrow()
  })
})

describe('generateToken / verifyToken', () => {
  it('應該生成 token 並驗證返回正確的 userId', () => {
    const userId = 'user-test-123'
    const token = generateToken(userId, STRONG_SECRET)
    const decoded = verifyToken(token, STRONG_SECRET)
    expect(decoded.userId).toBe(userId)
  })

  it('已過期的 token 應該拋出 "Token expired"', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60
    const expiredToken = jwt.sign({ userId: 'user-123', exp: pastExp }, STRONG_SECRET)
    expect(() => verifyToken(expiredToken, STRONG_SECRET)).toThrow('Token expired')
  })

  it('被竄改的 token 應該拋出 "Invalid token"', () => {
    const token = generateToken('user-123', STRONG_SECRET)
    const parts = token.split('.')
    parts[2] = 'invalidsignatureXXXXXXXXXXXXXXXX'
    const tampered = parts.join('.')
    expect(() => verifyToken(tampered, STRONG_SECRET)).toThrow('Invalid token')
  })
})
