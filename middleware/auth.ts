export default defineNuxtRouteMiddleware((to, from) => {
  const { token, user } = useLegacyAuth()

  // 如果沒有 token，重定向到登入頁面
  if (!token.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // 如果有 token 但沒有使用者資料，嘗試獲取使用者資料
  if (!user.value) {
    const { fetchUser } = useLegacyAuth()
    fetchUser()
  }
})
