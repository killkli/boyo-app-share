export default defineNuxtRouteMiddleware((to, from) => {
  // 使用 OAuth session (Auth.js)
  const { status } = useAuth()

  // 也檢查 legacy token 以向後相容
  const { token } = useLegacyAuth()

  // 如果 OAuth session 已認證，允許訪問
  if (status.value === 'authenticated') {
    return
  }

  // 如果有 legacy token，也允許訪問（向後相容）
  if (token.value) {
    return
  }

  // 否則重定向到登入頁面
  return navigateTo({
    path: '/login',
    query: { redirect: to.fullPath }
  })
})
