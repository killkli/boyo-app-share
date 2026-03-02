export default defineNitroPlugin((_nitroApp) => {
  const env = process.env.NODE_ENV

  // Skip validation in test environment
  if (env === 'test') {
    return
  }

  const config = useRuntimeConfig()

  const issues: string[] = []

  // Validate jwtSecret
  const jwtSecret = config.jwtSecret as string | undefined
  if (
    !jwtSecret ||
    jwtSecret.includes('change-in-production') ||
    jwtSecret.includes('your-super-secret') ||
    jwtSecret.includes('change-me')
  ) {
    issues.push('JWT_SECRET is missing or using a placeholder value')
  }

  // Validate databaseUrl
  const databaseUrl = config.databaseUrl as string | undefined
  if (
    !databaseUrl ||
    databaseUrl === 'postgresql://user:password@host:5432/database'
  ) {
    issues.push('DATABASE_URL is missing or using the placeholder value')
  }

  // Validate tebiAccessKey
  const tebiAccessKey = config.tebiAccessKey as string | undefined
  if (
    !tebiAccessKey ||
    tebiAccessKey === 'your-access-key' ||
    tebiAccessKey === 'change-me'
  ) {
    issues.push('TEBI_ACCESS_KEY is missing or using a placeholder value')
  }

  // Validate tebiSecretKey
  const tebiSecretKey = config.tebiSecretKey as string | undefined
  if (
    !tebiSecretKey ||
    tebiSecretKey === 'your-secret-key' ||
    tebiSecretKey === 'change-me'
  ) {
    issues.push('TEBI_SECRET_KEY is missing or using a placeholder value')
  }

  // Validate authSecret
  const authSecret = config.authSecret as string | undefined
  if (!authSecret || authSecret.includes('your-auth-secret')) {
    issues.push('AUTH_SECRET is missing or using a placeholder value')
  }

  if (issues.length === 0) {
    return
  }

  if (env === 'production') {
    throw new Error(
      `[Security] Server startup aborted due to insecure configuration:\n${issues.map((i) => `  - ${i}`).join('\n')}`
    )
  } else {
    for (const issue of issues) {
      console.warn(`[Security Warning] ${issue}`)
    }
  }
})
