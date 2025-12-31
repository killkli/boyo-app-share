<template>
  <div class="min-h-screen bg-background relative flex items-center justify-center px-4 py-12">
    <div class="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
    <Card class="w-full max-w-md relative z-10">
      <CardHeader class="space-y-2">
        <CardTitle class="text-3xl text-center uppercase font-black tracking-tight">註冊</CardTitle>
        <CardDescription class="text-center font-mono text-xs uppercase tracking-wide">
          建立您的帳號以開始分享應用
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- OAuth 社群登入/註冊 -->
        <div class="space-y-3 mb-6">
          <Button
            @click="loginWithGoogle"
            variant="outline"
            class="w-full font-bold uppercase tracking-wide flex items-center justify-center gap-2"
            type="button"
          >
            <GoogleIcon />
            使用 Google 註冊
          </Button>
        </div>

        <!-- 分隔線 -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t-2 border-muted"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-card text-muted-foreground font-mono text-xs uppercase tracking-wide">
              或使用 Email 註冊
            </span>
          </div>
        </div>

        <!-- Email/Password 註冊表單 -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div class="space-y-2">
            <label for="email" class="text-xs font-bold uppercase tracking-wide">Email</label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="YOUR@EMAIL.COM"
              required
              :disabled="loading"
              class="font-mono"
            />
          </div>

          <div class="space-y-2">
            <label for="username" class="text-xs font-bold uppercase tracking-wide">使用者名稱</label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="至少 3 個字元"
              required
              minlength="3"
              maxlength="50"
              :disabled="loading"
              class="font-mono"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-xs font-bold uppercase tracking-wide">密碼</label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="至少 8 個字元"
              required
              minlength="8"
              :disabled="loading"
              class="font-mono"
            />
          </div>

          <div class="space-y-2">
            <label for="confirmPassword" class="text-xs font-bold uppercase tracking-wide">確認密碼</label>
            <Input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="再次輸入密碼"
              required
              :disabled="loading"
              class="font-mono"
            />
          </div>

          <div v-if="error" class="p-4 bg-red-100 border-2 border-red-500">
            <p class="text-sm font-bold font-mono text-red-600 uppercase">{{ error }}</p>
          </div>

          <Button type="submit" class="w-full font-bold uppercase tracking-wide text-lg py-6" :disabled="loading">
            {{ loading ? '註冊中...' : '註冊' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-4 pt-4 border-t-2 border-muted mt-2">
        <p class="text-sm font-mono text-muted-foreground text-center">
          已經有帳號？
          <NuxtLink to="/login" class="font-bold text-primary uppercase decoration-2 hover:underline underline-offset-4 ml-1">
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
import GoogleIcon from '@/components/icons/GoogleIcon.vue'

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

const router = useRouter()
const { loginWithGoogle } = useOAuthAuth()

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
    // 使用舊的註冊 API（Legacy）
    // 注意：這仍然使用舊的 email/password 註冊方式
    // OAuth 註冊會在首次 OAuth 登入時自動建立帳號
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: email.value,
        username: username.value,
        password: password.value
      }
    })

    // 註冊成功，導向探索頁面
    await router.push('/explore')
  } catch (e: any) {
    console.error('Register error:', e)
    error.value = e.data?.message || e.message || '註冊失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
