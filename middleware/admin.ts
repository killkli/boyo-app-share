/**
 * Admin middleware - 保護管理員頁面
 * 非管理員將被重導向至首頁
 */

const ADMIN_EMAILS = ['dchensterebay@gmail.com']

export default defineNuxtRouteMiddleware(() => {
  const { status, data: session } = useAuth()

  // 未登入
  if (status.value !== 'authenticated') {
    return navigateTo('/login')
  }

  // 檢查是否為管理員
  const email = session.value?.user?.email
  if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
    return navigateTo('/')
  }
})
