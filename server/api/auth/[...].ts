import { NuxtAuthHandler } from '#auth'
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

    // OAuth Providers 將在 Stage 3 實作
    // GoogleProvider({...})
    // LineProvider({...})
    // FacebookProvider({...})
  ],

  callbacks: {
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
