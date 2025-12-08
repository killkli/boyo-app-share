export default defineNuxtRouteMiddleware((to, from) => {
  const { token } = useAuth()

  // 如果已經登入，重定向到首頁
  if (token.value) {
    return navigateTo('/')
  }
})
