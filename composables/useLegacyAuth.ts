export interface User {
  id: string
  email: string
  username: string
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string
}

export const useLegacyAuth = () => {
  const user = useState<User | null>('user', () => null)
  const token = useState<string>('token', () => '')

  const login = async (email: string, password: string) => {
    const response = await $fetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    user.value = response.user
    token.value = response.token

    // 儲存到 localStorage
    if (process.client) {
      localStorage.setItem('token', response.token)
    }

    return response
  }

  const register = async (email: string, username: string, password: string) => {
    const response = await $fetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: { email, username, password }
    })

    user.value = response.user
    token.value = response.token

    if (process.client) {
      localStorage.setItem('token', response.token)
    }

    return response
  }

  const logout = () => {
    user.value = null
    token.value = ''

    if (process.client) {
      localStorage.removeItem('token')
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const response = await $fetch<{ user: User }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      user.value = response.user
    } catch (error) {
      // Token 無效，清除認證狀態
      logout()
    }
  }

  // 初始化時從 localStorage 恢復 token
  const initAuth = () => {
    if (process.client) {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        token.value = savedToken
        fetchUser()
      }
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    login,
    register,
    logout,
    fetchUser,
    initAuth
  }
}
