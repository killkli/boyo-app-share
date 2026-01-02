/**
 * 管理員權限判斷 composable
 */

const ADMIN_EMAILS = ['dchensterebay@gmail.com']

export const useAdmin = () => {
  const { data: session, status } = useAuth()

  /**
   * 判斷當前使用者是否為管理員
   */
  const isAdmin = computed(() => {
    if (status.value !== 'authenticated') return false

    const email = session.value?.user?.email
    if (!email) return false

    return ADMIN_EMAILS.includes(email.toLowerCase())
  })

  return {
    isAdmin
  }
}
