export default defineNuxtRouteMiddleware((to, from) => {
  // 使用 OAuth session (Auth.js)
  const { status } = useAuth()

  // 也檢查 legacy token 以向後相容
  const { token } = useLegacyAuth()

  // 如果 OAuth session 已認證，重定向到首頁
  if (status.value === 'authenticated') {
    return navigateTo('/')
  }

  // 如果有 legacy token，也重定向到首頁（向後相容）
  if (token.value) {
    return navigateTo('/')
  }
})
