<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-12">
      <!-- 標題區塊 -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 border-b-4 border-foreground pb-4 inline-block">
          管理員後台
        </h1>
        <p class="text-lg text-muted-foreground font-mono mt-4">
          平臺數據總覽
        </p>
      </div>

      <!-- 載入中 -->
      <div v-if="pending" class="flex justify-center py-12">
        <div class="border-3 border-foreground p-8 bg-muted">
          <p class="text-xl font-bold uppercase tracking-wide animate-pulse">載入中……</p>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div v-else-if="error" class="max-w-2xl mx-auto">
        <Card class="border-3 border-destructive shadow-brutal-lg">
          <CardContent class="pt-6">
            <p class="text-destructive font-bold">{{ error.message }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- 統計卡片 -->
      <div v-else-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <!-- 總使用者數 -->
        <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow">
          <CardHeader class="bg-primary/10 border-b-3 border-foreground">
            <CardTitle class="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
              <span class="text-2xl">👥</span>
              總使用者數
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <p class="text-5xl font-bold">{{ stats.totalUsers }}</p>
            <p class="text-sm text-muted-foreground font-mono mt-2">
              今日新增：{{ stats.todayUsers }}
            </p>
          </CardContent>
        </Card>

        <!-- 總 App 數 -->
        <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow">
          <CardHeader class="bg-primary/10 border-b-3 border-foreground">
            <CardTitle class="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
              <span class="text-2xl">📱</span>
              總應用數
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <p class="text-5xl font-bold">{{ stats.totalApps }}</p>
            <p class="text-sm text-muted-foreground font-mono mt-2">
              今日新增：{{ stats.todayApps }}
            </p>
          </CardContent>
        </Card>

        <!-- 總留言數 -->
        <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow">
          <CardHeader class="bg-primary/10 border-b-3 border-foreground">
            <CardTitle class="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
              <span class="text-2xl">💬</span>
              總留言數
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <p class="text-5xl font-bold">{{ stats.totalComments }}</p>
          </CardContent>
        </Card>

        <!-- 總評分數 -->
        <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow">
          <CardHeader class="bg-primary/10 border-b-3 border-foreground">
            <CardTitle class="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
              <span class="text-2xl">⭐</span>
              總評分數
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <p class="text-5xl font-bold">{{ stats.totalRatings }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- 管理功能導航 -->
      <div v-if="stats" class="mt-12 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold uppercase tracking-wide mb-6 border-b-3 border-foreground pb-2">
          管理功能
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 用戶管理 -->
          <NuxtLink to="/admin/users">
            <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow cursor-pointer">
              <CardHeader class="bg-muted border-b-3 border-foreground">
                <CardTitle class="text-lg font-bold uppercase">使用者管理</CardTitle>
              </CardHeader>
              <CardContent class="pt-4">
                <p class="text-sm text-muted-foreground font-mono">檢視與管理平臺使用者</p>
                <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary mt-2">
                  <span>前往</span>
                  <span>→</span>
                </div>
              </CardContent>
            </Card>
          </NuxtLink>

          <!-- App 管理 -->
          <NuxtLink to="/admin/apps">
            <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow cursor-pointer">
              <CardHeader class="bg-muted border-b-3 border-foreground">
                <CardTitle class="text-lg font-bold uppercase">應用管理</CardTitle>
              </CardHeader>
              <CardContent class="pt-4">
                <p class="text-sm text-muted-foreground font-mono">檢視與管理平臺應用</p>
                <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary mt-2">
                  <span>前往</span>
                  <span>→</span>
                </div>
              </CardContent>
            </Card>
          </NuxtLink>

          <!-- 留言管理 -->
          <NuxtLink to="/admin/comments">
            <Card class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow cursor-pointer">
              <CardHeader class="bg-muted border-b-3 border-foreground">
                <CardTitle class="text-lg font-bold uppercase">留言管理</CardTitle>
              </CardHeader>
              <CardContent class="pt-4">
                <p class="text-sm text-muted-foreground font-mono">檢視與管理平臺留言</p>
                <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary mt-2">
                  <span>前往</span>
                  <span>→</span>
                </div>
              </CardContent>
            </Card>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

interface AdminStats {
  totalUsers: number
  totalApps: number
  totalComments: number
  totalRatings: number
  todayUsers: number
  todayApps: number
}

const { data: stats, pending, error } = await useFetch<AdminStats>('/api/admin/stats')
</script>
