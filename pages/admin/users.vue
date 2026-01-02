<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-12">
      <!-- 標題區塊 -->
      <div class="mb-8">
        <NuxtLink to="/admin" class="text-sm font-mono text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← 返回管理後台
        </NuxtLink>
        <h1 class="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 border-b-4 border-foreground pb-4 inline-block">
          用戶管理
        </h1>
      </div>

      <!-- 搜尋和篩選 -->
      <Card class="border-3 border-foreground shadow-brutal mb-8">
        <CardContent class="pt-6">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- 搜尋框 -->
            <div class="flex-1">
              <Input
                v-model="searchQuery"
                placeholder="搜尋 email 或用戶名..."
                class="border-3 border-foreground"
                @keyup.enter="search"
              />
            </div>

            <!-- 狀態篩選 -->
            <Select v-model="statusFilter">
              <SelectTrigger class="w-full md:w-48 border-3 border-foreground">
                <SelectValue placeholder="狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="active">啟用</SelectItem>
                <SelectItem value="inactive">已禁用</SelectItem>
              </SelectContent>
            </Select>

            <!-- 搜尋按鈕 -->
            <Button @click="search" class="border-3 border-foreground shadow-brutal">
              搜尋
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 載入中 -->
      <div v-if="pending" class="flex justify-center py-12">
        <div class="border-3 border-foreground p-8 bg-muted">
          <p class="text-xl font-bold uppercase tracking-wide animate-pulse">載入中...</p>
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

      <!-- 用戶列表 -->
      <div v-else-if="data" class="space-y-4">
        <!-- 統計 -->
        <p class="text-sm text-muted-foreground font-mono mb-4">
          共 {{ data.pagination.total }} 位用戶，第 {{ data.pagination.page }} / {{ data.pagination.totalPages }} 頁
        </p>

        <!-- 用戶卡片 -->
        <Card
          v-for="user in data.users"
          :key="user.id"
          class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow"
        >
          <CardContent class="pt-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <!-- 用戶資訊 -->
              <div class="flex items-center gap-4">
                <!-- 頭像 -->
                <div class="w-12 h-12 border-3 border-foreground bg-primary/10 flex items-center justify-center font-bold text-lg uppercase">
                  {{ getUserInitials(user.username || user.email) }}
                </div>
                <div>
                  <p class="font-bold text-lg">{{ user.username }}</p>
                  <p class="text-sm text-muted-foreground font-mono">{{ user.email }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <Badge :variant="user.isActive ? 'default' : 'destructive'">
                      {{ user.isActive ? '啟用' : '已禁用' }}
                    </Badge>
                    <span class="text-xs text-muted-foreground">
                      {{ user.appCount }} 個應用
                    </span>
                  </div>
                </div>
              </div>

              <!-- 操作按鈕 -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground font-mono">
                  註冊於 {{ formatDate(user.createdAt) }}
                </span>
                <Button
                  v-if="user.isActive"
                  variant="outline"
                  size="sm"
                  class="border-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  :disabled="isUpdating === user.id"
                  @click="toggleUserStatus(user.id, false)"
                >
                  {{ isUpdating === user.id ? '處理中...' : '禁用' }}
                </Button>
                <Button
                  v-else
                  variant="outline"
                  size="sm"
                  class="border-3 border-foreground"
                  :disabled="isUpdating === user.id"
                  @click="toggleUserStatus(user.id, true)"
                >
                  {{ isUpdating === user.id ? '處理中...' : '啟用' }}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 空狀態 -->
        <div v-if="data.users.length === 0" class="text-center py-12">
          <p class="text-xl text-muted-foreground">沒有找到符合條件的用戶</p>
        </div>

        <!-- 分頁 -->
        <div v-if="data.pagination.totalPages > 1" class="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            class="border-3 border-foreground"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            上一頁
          </Button>
          <span class="flex items-center px-4 font-mono">
            {{ currentPage }} / {{ data.pagination.totalPages }}
          </span>
          <Button
            variant="outline"
            class="border-3 border-foreground"
            :disabled="currentPage >= data.pagination.totalPages"
            @click="goToPage(currentPage + 1)"
          >
            下一頁
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

interface User {
  id: string
  email: string
  username: string
  avatarUrl: string | null
  emailVerified: boolean
  isActive: boolean
  appCount: number
  createdAt: string
  updatedAt: string
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 狀態
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const isUpdating = ref<string | null>(null)

// 查詢參數
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: 20,
  search: searchQuery.value || undefined,
  status: statusFilter.value
}))

// 取得用戶列表
const { data, pending, error, refresh } = await useFetch<UsersResponse>('/api/admin/users', {
  query: queryParams
})

// 搜尋
const search = () => {
  currentPage.value = 1
  refresh()
}

// 切換頁面
const goToPage = (page: number) => {
  currentPage.value = page
  refresh()
}

// 切換用戶狀態
const toggleUserStatus = async (userId: string, isActive: boolean) => {
  isUpdating.value = userId

  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: { isActive }
    })
    await refresh()
  } catch (err: any) {
    alert(err.data?.message || '操作失敗')
  } finally {
    isUpdating.value = null
  }
}

// 取得用戶名首字母
const getUserInitials = (name: string): string => {
  return name.slice(0, 2).toUpperCase()
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>
