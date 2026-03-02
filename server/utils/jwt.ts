import jwt from 'jsonwebtoken'

const WEAK_SECRET_PATTERNS = [
  'change-in-production',
  'your-super-secret',
  'change-me',
  'your-secret',
  'default',
  'example',
  'password',
  'secret-key',
]

/**
 * Validates the strength of a JWT secret.
 * Throws an error if the secret is too short or matches known weak patterns.
 */
export const validateSecretStrength = (secret: string): void => {
  if (secret.length < 32) {
    throw new Error('JWT secret must be at least 32 characters long')
  }
  const lower = secret.toLowerCase()
  for (const pattern of WEAK_SECRET_PATTERNS) {
    if (lower.includes(pattern)) {
      throw new Error(`JWT secret must not contain weak pattern: "${pattern}"`)
    }
  }
}

/**
 * 取得 JWT 密鑰
 * 可用於測試環境的依賴注入
 */
const getSecret = (): string => {
  // 在測試環境中使用環境變數
  if (process.env.NODE_ENV === 'test' && process.env.JWT_SECRET) {
    return process.env.JWT_SECRET
  }

  // 在 Nuxt 環境中使用 runtime config
  const config = useRuntimeConfig()
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured')
  }

  validateSecretStrength(config.jwtSecret)

  return config.jwtSecret
}

/**
 * 生成 JWT Token
 * @param userId 使用者 ID
 * @param secret 可選的密鑰（用於測試）
 * @returns JWT token 字串
 */
export const generateToken = (userId: string, secret?: string): string => {
  const jwtSecret = secret || getSecret()

  return jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: '7d' }
  )
}

/**
 * 驗證 JWT Token
 * @param token JWT token 字串
 * @param secret 可選的密鑰（用於測試）
 * @returns 解碼後的 payload，包含 userId
 * @throws 如果 token 無效或過期
 */
export const verifyToken = (token: string, secret?: string): { userId: string } => {
  const jwtSecret = secret || getSecret()

  if (!token || token.trim() === '') {
    throw new Error('Token is required')
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw error
  }
}
