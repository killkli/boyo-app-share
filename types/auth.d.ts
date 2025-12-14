import { DefaultSession } from 'next-auth'

/**
 * Auth.js Type Definitions
 * 擴展 next-auth 的型別以包含自訂欄位
 */

declare module 'next-auth' {
  /**
   * Session 型別擴展
   */
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
    } & DefaultSession['user']
  }

  /**
   * User 型別擴展
   */
  interface User {
    id: string
    email: string
    name: string
    image?: string
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWT Token 型別擴展
   */
  interface JWT {
    id: string
    email: string
    name: string
    picture?: string
  }
}
