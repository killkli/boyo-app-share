import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import LineProvider from 'next-auth/providers/line'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { query } from '~/server/utils/db'

const config = useRuntimeConfig()

export default NuxtAuthHandler({
  secret: config.authSecret,

  // JWT strategy (與現有系統相容)
  session: {
    strategy: 'jwt'
  },

  providers: [
    // Google OAuth 2.0
    GoogleProvider({
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),

    // LINE Login
    LineProvider({
      clientId: config.lineClientId,
      clientSecret: config.lineClientSecret
    }),

    // Facebook Login
    FacebookProvider({
      clientId: config.facebookClientId,
      clientSecret: config.facebookClientSecret
    }),

    // Credentials Provider (保留現有 email/password 登入)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // 查詢使用者
          const result = await query(
            'SELECT id, email, username, password_hash, avatar_url, image FROM users WHERE email = $1',
            [credentials.email]
          )

          if (result.rows.length === 0) {
            return null
          }

          const user = result.rows[0]

          // 檢查是否為 OAuth 使用者（無密碼）
          if (!user.password_hash) {
            throw new Error('此帳號使用社群登入，請使用對應的社群帳號登入')
          }

          // 驗證密碼
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isValid) {
            return null
          }

          // 返回使用者資訊
          return {
            id: user.id,
            email: user.email,
            name: user.username,
            image: user.image || user.avatar_url
          }
        } catch (error) {
          console.error('Credentials auth error:', error)
          throw error
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // OAuth 登入處理
      if (account?.provider !== 'credentials') {
        try {
          // 檢查使用者是否已存在
          const existingUser = await query(
            'SELECT id, email, username, image FROM users WHERE email = $1',
            [user.email]
          )

          let userId: string

          if (existingUser.rows.length === 0) {
            // 建立新使用者
            const username = user.email?.split('@')[0] || user.name || `user_${Date.now()}`
            const result = await query(
              `INSERT INTO users (email, username, avatar_url, image, email_verified)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id`,
              [user.email, username, user.image, user.image, true]
            )
            userId = result.rows[0].id
            user.id = userId
          } else {
            userId = existingUser.rows[0].id
            user.id = userId

            // 更新使用者資訊（同步最新的頭像和驗證狀態）
            await query(
              `UPDATE users
               SET image = $1, email_verified = $2, updated_at = NOW()
               WHERE id = $3`,
              [user.image, true, userId]
            )
          }

          // 儲存或更新 account（使用 ON CONFLICT 避免重複）
          await query(
            `INSERT INTO accounts (
              user_id, type, provider, provider_account_id,
              access_token, refresh_token, expires_at, token_type, scope, id_token
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (provider, provider_account_id)
            DO UPDATE SET
              access_token = $5,
              refresh_token = $6,
              expires_at = $7,
              updated_at = NOW()`,
            [
              userId,
              account.type,
              account.provider,
              account.providerAccountId,
              account.access_token,
              account.refresh_token,
              account.expires_at,
              account.token_type,
              account.scope,
              account.id_token
            ]
          )

          return true
        } catch (error) {
          console.error('OAuth sign in error:', error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user }) {
      // 首次登入時，將使用者資訊加到 token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },

    async session({ session, token }) {
      // 將 token 資訊加到 session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    }
  },

  pages: {
    signIn: '/login',  // 自訂登入頁面
    error: '/login'    // 錯誤時重定向到登入頁
  }
})
