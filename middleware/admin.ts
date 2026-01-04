/**
 * Admin middleware - 保護管理員頁面
 * 非管理員將被重導向至首頁
 */

export default defineNuxtRouteMiddleware(() => {
  const { status } = useAuth()
  const { isAdmin } = useAdmin()

  // 未登入
  if (status.value !== 'authenticated') {
    return navigateTo('/login')
  }

  // 檢查是否為管理員
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
