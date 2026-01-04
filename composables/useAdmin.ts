/**
 * 管理員權限判斷 composable
 */
export const useAdmin = () => {
  const { data: session, status } = useAuth()
  const config = useRuntimeConfig()

  /**
   * 判斷當前使用者是否為管理員
   */
  const isAdmin = computed(() => {
    if (status.value !== 'authenticated') return false

    const email = session.value?.user?.email
    if (!email) return false

    const adminEmailsConfig = config.public.adminEmails
    const adminEmails = Array.isArray(adminEmailsConfig)
      ? adminEmailsConfig
      : (String(adminEmailsConfig) || '').split(',').map(e => e.trim())

    return adminEmails.some(adminEmail => adminEmail.toLowerCase() === email.toLowerCase())
  })

  return {
    isAdmin
  }
}
