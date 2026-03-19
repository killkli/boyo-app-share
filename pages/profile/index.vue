<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-12">
      <!-- 標題區塊 - Brutalist -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 border-b-4 border-foreground pb-4 inline-block">
          個人中心
        </h1>
        <p class="text-lg text-muted-foreground font-mono mt-4">
          管理您的應用和收藏
        </p>
      </div>

      <!-- 使用者資訊卡片 -->
      <Card v-if="user" class="border-3 border-foreground shadow-brutal-lg mb-12 max-w-2xl mx-auto">
        <CardHeader class="bg-muted border-b-3 border-foreground">
          <CardTitle class="text-2xl font-bold uppercase tracking-wide">使用者資訊</CardTitle>
        </CardHeader>
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <!-- 方形頭像 -->
            <div class="w-16 h-16 border-3 border-foreground bg-primary flex items-center justify-center font-bold text-xl text-primary-foreground uppercase">
              {{ getUserInitials(user.name || user.email || 'U') }}
            </div>
            <div>
              <p class="font-bold text-xl">{{ user.name || user.email }}</p>
              <p class="text-sm text-muted-foreground font-mono">{{ user.email }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 導航卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <!-- 我的作品 -->
        <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow cursor-pointer">
          <NuxtLink to="/profile/my-apps" class="block">
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <CardTitle class="text-2xl font-bold uppercase tracking-wide">我的作品</CardTitle>
            </CardHeader>
            <CardContent class="pt-6">
              <div class="space-y-3">
                <div class="w-16 h-16 border-3 border-foreground bg-primary/10 flex items-center justify-center">
                  <span class="text-3xl">📱</span>
                </div>
                <p class="text-muted-foreground font-mono">
                  檢視與管理您建立的所有應用
                </p>
                <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                  <span>前往</span>
                  <span>→</span>
                </div>
              </div>
            </CardContent>
          </NuxtLink>
        </Card>

        <!-- 我的收藏 -->
        <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow cursor-pointer">
          <NuxtLink to="/profile/favorites" class="block">
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <CardTitle class="text-2xl font-bold uppercase tracking-wide">我的收藏</CardTitle>
            </CardHeader>
            <CardContent class="pt-6">
              <div class="space-y-3">
                <div class="w-16 h-16 border-3 border-foreground bg-primary/10 flex items-center justify-center">
                  <span class="text-3xl">⭐</span>
                </div>
                <p class="text-muted-foreground font-mono">
                  瀏覽您收藏的所有應用
                </p>
                <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                  <span>前往</span>
                  <span>→</span>
                </div>
              </div>
            </CardContent>
          </NuxtLink>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

definePageMeta({
  layout: 'default',
  middleware: 'auth' // 需要登入才能訪問
})

const { user } = useOAuthAuth()

// 如果未登入，重定向到登入頁
if (!user.value) {
  navigateTo('/login')
}

// 獲取使用者姓名縮寫
const getUserInitials = (username: string): string => {
  return username.slice(0, 2).toUpperCase()
}
</script>
