<template>
  <div class="min-h-screen bg-background relative flex items-center justify-center px-4 py-12">
    <div class="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
    <Card class="w-full max-w-md relative z-10">
      <CardHeader class="space-y-2">
        <CardTitle class="text-3xl text-center uppercase font-black tracking-tight">登入</CardTitle>
        <CardDescription class="text-center font-mono text-xs uppercase tracking-wide">
          登入您的帳號以開始使用
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- OAuth 社群登入 -->
        <div class="space-y-3 mb-6">
          <Button
            @click="loginWithGoogle"
            variant="outline"
            class="w-full font-bold uppercase tracking-wide flex items-center justify-center gap-2"
            type="button"
          >
            <GoogleIcon />
            使用 Google 登入
          </Button>

          <Button
            @click="loginWithLine"
            variant="outline"
            class="w-full font-bold uppercase tracking-wide flex items-center justify-center gap-2"
            type="button"
          >
            <LineIcon />
            使用 LINE 登入
          </Button>

          <Button
            @click="loginWithFacebook"
            variant="outline"
            class="w-full font-bold uppercase tracking-wide flex items-center justify-center gap-2"
            type="button"
          >
            <FacebookIcon />
            使用 Facebook 登入
          </Button>
        </div>

        <!-- 分隔線 -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t-2 border-muted"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-card text-muted-foreground font-mono text-xs uppercase tracking-wide">
              或使用 Email
            </span>
          </div>
        </div>

        <!-- Email/Password 登入表單 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
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
            <label for="password" class="text-xs font-bold uppercase tracking-wide">密碼</label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="loading"
              class="font-mono"
            />
          </div>

          <div v-if="error" class="p-4 bg-red-100 border-2 border-red-500">
            <p class="text-sm font-bold font-mono text-red-600 uppercase">{{ error }}</p>
          </div>

          <Button type="submit" class="w-full font-bold uppercase tracking-wide text-lg py-6" :disabled="loading">
            {{ loading ? '登入中...' : '登入' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-4 pt-4 border-t-2 border-muted mt-2">
        <p class="text-sm font-mono text-muted-foreground text-center">
          還沒有帳號？
          <NuxtLink to="/register" class="font-bold text-primary uppercase decoration-2 hover:underline underline-offset-4 ml-1">
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
import GoogleIcon from '@/components/icons/GoogleIcon.vue'
import LineIcon from '@/components/icons/LineIcon.vue'
import FacebookIcon from '@/components/icons/FacebookIcon.vue'

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

const router = useRouter()
const { loginWithGoogle, loginWithLine, loginWithFacebook, loginWithCredentials } = useOAuthAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await loginWithCredentials(email.value, password.value)

    // 登入成功，導向探索頁面或原本要前往的頁面
    const redirect = router.currentRoute.value.query.redirect as string
    await router.push(redirect || '/explore')
  } catch (e: any) {
    console.error('Login error:', e)
    error.value = e.message || '登入失敗，請檢查您的帳號密碼'
  } finally {
    loading.value = false
  }
}
</script>
