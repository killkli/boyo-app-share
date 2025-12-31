/**
 * Wrapper composable for OAuth authentication using @sidebase/nuxt-auth
 */
export const useOAuthAuth = () => {
  const { status, data: session, signIn, signOut } = useAuth()

  const isAuthenticated = computed(() => status.value === 'authenticated')
  const user = computed(() => session.value?.user)

  const loginWithGoogle = () => {
    signIn('google', { callbackUrl: '/explore' })
  }

  const loginWithCredentials = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    return result
  }

  const logout = () => {
    signOut({ callbackUrl: '/' })
  }

  return {
    session,
    status,
    isAuthenticated,
    user,
    loginWithGoogle,
    loginWithCredentials,
    logout
  }
}
