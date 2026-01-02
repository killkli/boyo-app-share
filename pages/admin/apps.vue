<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-12">
      <!-- 標題區塊 -->
      <div class="mb-8">
        <NuxtLink to="/admin" class="text-sm font-mono text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← 返回管理後台
        </NuxtLink>
        <h1 class="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 border-b-4 border-foreground pb-4 inline-block">
          應用管理
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
                placeholder="搜尋標題或描述..."
                class="border-3 border-foreground"
                @keyup.enter="search"
              />
            </div>

            <!-- 公開/私人篩選 -->
            <Select v-model="visibilityFilter">
              <SelectTrigger class="w-full md:w-40 border-3 border-foreground">
                <SelectValue placeholder="可見性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="public">公開</SelectItem>
                <SelectItem value="private">私人</SelectItem>
              </SelectContent>
            </Select>

            <!-- 精選篩選 -->
            <Select v-model="featuredFilter">
              <SelectTrigger class="w-full md:w-40 border-3 border-foreground">
                <SelectValue placeholder="精選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="featured">精選</SelectItem>
                <SelectItem value="normal">一般</SelectItem>
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

      <!-- App 列表 -->
      <div v-else-if="data" class="space-y-4">
        <!-- 統計 -->
        <p class="text-sm text-muted-foreground font-mono mb-4">
          共 {{ data.pagination.total }} 個應用，第 {{ data.pagination.page }} / {{ data.pagination.totalPages }} 頁
        </p>

        <!-- App 卡片 -->
        <Card
          v-for="app in data.apps"
          :key="app.id"
          class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow"
        >
          <CardContent class="pt-6">
            <div class="flex flex-col gap-4">
              <!-- App 資訊 -->
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <NuxtLink :to="`/app/${app.id}`" class="font-bold text-lg hover:underline">
                      {{ app.title }}
                    </NuxtLink>
                    <Badge v-if="app.isFeatured" variant="default" class="bg-yellow-500">
                      精選
                    </Badge>
                    <Badge :variant="app.isPublic ? 'outline' : 'secondary'">
                      {{ app.isPublic ? '公開' : '私人' }}
                    </Badge>
                  </div>
                  <p class="text-sm text-muted-foreground line-clamp-2">
                    {{ app.description || '無描述' }}
                  </p>
                  <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-mono">
                    <span>作者: {{ app.author.username }}</span>
                    <span>👁 {{ app.viewCount }}</span>
                    <span>💬 {{ app.commentCount }}</span>
                    <span>⭐ {{ app.avgRating.toFixed(1) }}</span>
                  </div>
                </div>
              </div>

              <!-- 操作按鈕 -->
              <div class="flex items-center justify-between border-t-2 border-foreground/20 pt-4">
                <span class="text-xs text-muted-foreground font-mono">
                  建立於 {{ formatDate(app.createdAt) }}
                </span>
                <div class="flex items-center gap-2">
                  <!-- 精選切換 -->
                  <Button
                    v-if="!app.isFeatured"
                    variant="outline"
                    size="sm"
                    class="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white"
                    :disabled="isUpdating === app.id"
                    @click="toggleFeatured(app.id, true)"
                  >
                    {{ isUpdating === app.id ? '處理中...' : '設為精選' }}
                  </Button>
                  <Button
                    v-else
                    variant="outline"
                    size="sm"
                    class="border-2 border-foreground"
                    :disabled="isUpdating === app.id"
                    @click="toggleFeatured(app.id, false)"
                  >
                    {{ isUpdating === app.id ? '處理中...' : '取消精選' }}
                  </Button>

                  <!-- 刪除按鈕 -->
                  <Button
                    variant="outline"
                    size="sm"
                    class="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    :disabled="isDeleting === app.id"
                    @click="confirmDelete(app)"
                  >
                    {{ isDeleting === app.id ? '刪除中...' : '刪除' }}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 空狀態 -->
        <div v-if="data.apps.length === 0" class="text-center py-12">
          <p class="text-xl text-muted-foreground">沒有找到符合條件的應用</p>
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

    <!-- 刪除確認 Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="border-3 border-foreground">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold uppercase">確認刪除</DialogTitle>
          <DialogDescription>
            確定要刪除「{{ appToDelete?.title }}」嗎？此操作無法復原。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showDeleteDialog = false">
            取消
          </Button>
          <Button
            variant="destructive"
            :disabled="isDeleting !== null"
            @click="deleteApp"
          >
            {{ isDeleting ? '刪除中...' : '確認刪除' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

interface AppAuthor {
  id: string
  username: string
  email: string
}

interface App {
  id: string
  title: string
  description: string | null
  category: string | null
  tags: string[] | null
  uploadType: string
  isPublic: boolean
  isFeatured: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  avgRating: number
  createdAt: string
  updatedAt: string
  author: AppAuthor
}

interface AppsResponse {
  apps: App[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 狀態
const searchQuery = ref('')
const visibilityFilter = ref('all')
const featuredFilter = ref('all')
const currentPage = ref(1)
const isUpdating = ref<string | null>(null)
const isDeleting = ref<string | null>(null)
const showDeleteDialog = ref(false)
const appToDelete = ref<App | null>(null)

// 查詢參數
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: 20,
  search: searchQuery.value || undefined,
  visibility: visibilityFilter.value,
  featured: featuredFilter.value
}))

// 取得 App 列表
const { data, pending, error, refresh } = await useFetch<AppsResponse>('/api/admin/apps', {
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

// 切換精選狀態
const toggleFeatured = async (appId: string, isFeatured: boolean) => {
  isUpdating.value = appId

  try {
    await $fetch(`/api/admin/apps/${appId}/featured`, {
      method: 'PUT',
      body: { isFeatured }
    })
    await refresh()
  } catch (err: any) {
    alert(err.data?.message || '操作失敗')
  } finally {
    isUpdating.value = null
  }
}

// 確認刪除
const confirmDelete = (app: App) => {
  appToDelete.value = app
  showDeleteDialog.value = true
}

// 刪除 App
const deleteApp = async () => {
  if (!appToDelete.value) return

  isDeleting.value = appToDelete.value.id

  try {
    await $fetch(`/api/admin/apps/${appToDelete.value.id}`, {
      method: 'DELETE'
    })
    showDeleteDialog.value = false
    appToDelete.value = null
    await refresh()
  } catch (err: any) {
    alert(err.data?.message || '刪除失敗')
  } finally {
    isDeleting.value = null
  }
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
