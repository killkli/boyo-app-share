<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl text-center">註冊</CardTitle>
        <CardDescription class="text-center">
          建立您的帳號以開始分享應用
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRegister" class="space-y-4">
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
            <label for="username" class="text-sm font-medium">使用者名稱</label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="至少 3 個字元"
              required
              minlength="3"
              maxlength="50"
              :disabled="loading"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">密碼</label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="至少 8 個字元"
              required
              minlength="8"
              :disabled="loading"
            />
          </div>

          <div class="space-y-2">
            <label for="confirmPassword" class="text-sm font-medium">確認密碼</label>
            <Input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="再次輸入密碼"
              required
              :disabled="loading"
            />
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '註冊中...' : '註冊' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-2">
        <p class="text-sm text-gray-600 text-center">
          已經有帳號？
          <NuxtLink to="/login" class="text-blue-600 hover:underline">
            立即登入
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
const { register } = useAuth()

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  // 驗證密碼確認
  if (password.value !== confirmPassword.value) {
    error.value = '密碼確認不符'
    return
  }

  // 驗證使用者名稱長度
  if (username.value.length < 3 || username.value.length > 50) {
    error.value = '使用者名稱必須介於 3-50 個字元'
    return
  }

  // 驗證密碼長度
  if (password.value.length < 8) {
    error.value = '密碼至少需要 8 個字元'
    return
  }

  loading.value = true

  try {
    await register(email.value, username.value, password.value)

    // 註冊成功，導向首頁
    await router.push('/')
  } catch (e: any) {
    console.error('Register error:', e)
    error.value = e.data?.message || e.message || '註冊失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
