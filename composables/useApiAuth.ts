/**
 * 統一的 API 認證 composable
 * 同時支援 OAuth session (Auth.js) 和 Legacy token
 */
export const useApiAuth = () => {
  // OAuth session (Auth.js)
  const { status, data: session } = useAuth()

  // Legacy token
  const { token } = useLegacyAuth()

  /**
   * 檢查是否已認證（OAuth 或 Legacy）
   */
  const isAuthenticated = computed(() => {
    return status.value === 'authenticated' || !!token.value
  })

  /**
   * 獲取當前使用者資訊
   */
  const user = computed(() => {
    if (status.value === 'authenticated' && session.value?.user) {
      return {
        id: session.value.user.id,
        email: session.value.user.email,
        name: session.value.user.name,
        image: session.value.user.image
      }
    }
    return null
  })

  /**
   * 獲取 API 請求的認證 headers
   * - 如果有 legacy token，使用 Bearer token（向後相容）
   * - 如果沒有 legacy token，返回空對象（讓 Auth.js cookies 處理）
   */
  const getAuthHeaders = (): Record<string, string> => {
    if (token.value) {
      return {
        Authorization: `Bearer ${token.value}`
      }
    }
    // OAuth 使用者不需要 Authorization header，cookies 會自動發送
    return {}
  }

  /**
   * 執行需要認證的 API 請求
   * 自動處理認證 headers
   */
  const authFetch = async <T>(
    url: string,
    options: Parameters<typeof $fetch>[1] = {}
  ): Promise<T> => {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers
    }

    return $fetch<T>(url, {
      ...options,
      headers
    })
  }

  return {
    isAuthenticated,
    user,
    status,
    session,
    token,
    getAuthHeaders,
    authFetch
  }
}
