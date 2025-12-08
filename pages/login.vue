<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl text-center">登入</CardTitle>
        <CardDescription class="text-center">
          登入您的帳號以開始使用
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">Email</label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">密碼</label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '登入中...' : '登入' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-2">
        <p class="text-sm text-gray-600 text-center">
          還沒有帳號？
          <NuxtLink to="/register" class="text-blue-600 hover:underline">
            立即註冊
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await login(email.value, password.value)

    // 登入成功，導向首頁或原本要前往的頁面
    const redirect = router.currentRoute.value.query.redirect as string
    await router.push(redirect || '/')
  } catch (e: any) {
    console.error('Login error:', e)
    error.value = e.data?.message || e.message || '登入失敗，請檢查您的帳號密碼'
  } finally {
    loading.value = false
  }
}
</script>
