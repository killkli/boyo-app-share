<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-12">
      <!-- 標題區塊 -->
      <div class="mb-8">
        <NuxtLink to="/admin" class="text-sm font-mono text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← 返回管理後台
        </NuxtLink>
        <h1 class="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 border-b-4 border-foreground pb-4 inline-block">
          留言管理
        </h1>
      </div>

      <!-- 搜尋 -->
      <Card class="border-3 border-foreground shadow-brutal mb-8">
        <CardContent class="pt-6">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- 搜尋框 -->
            <div class="flex-1">
              <Input
                v-model="searchQuery"
                placeholder="搜尋留言內容..."
                class="border-3 border-foreground"
                @keyup.enter="search"
              />
            </div>

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

      <!-- 留言列表 -->
      <div v-else-if="data" class="space-y-4">
        <!-- 統計 -->
        <p class="text-sm text-muted-foreground font-mono mb-4">
          共 {{ data.pagination.total }} 則留言，第 {{ data.pagination.page }} / {{ data.pagination.totalPages }} 頁
        </p>

        <!-- 留言卡片 -->
        <Card
          v-for="comment in data.comments"
          :key="comment.id"
          class="border-3 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow"
        >
          <CardContent class="pt-6">
            <div class="flex flex-col gap-4">
              <!-- 留言內容 -->
              <div>
                <p class="text-base whitespace-pre-wrap">{{ comment.content }}</p>
              </div>

              <!-- 留言資訊和操作 -->
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t-2 border-foreground/20 pt-4">
                <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs text-muted-foreground font-mono">
                  <span>作者: {{ comment.author.username }}</span>
                  <span>
                    應用:
                    <NuxtLink :to="`/app/${comment.app.id}`" class="text-primary hover:underline">
                      {{ comment.app.title }}
                    </NuxtLink>
                  </span>
                  <span>{{ formatDate(comment.createdAt) }}</span>
                </div>

                <!-- 刪除按鈕 -->
                <Button
                  variant="outline"
                  size="sm"
                  class="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  :disabled="isDeleting === comment.id"
                  @click="confirmDelete(comment)"
                >
                  {{ isDeleting === comment.id ? '刪除中...' : '刪除' }}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 空狀態 -->
        <div v-if="data.comments.length === 0" class="text-center py-12">
          <p class="text-xl text-muted-foreground">沒有找到符合條件的留言</p>
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
            確定要刪除這則留言嗎？此操作無法復原。
          </DialogDescription>
        </DialogHeader>
        <div v-if="commentToDelete" class="my-4 p-4 bg-muted border-2 border-foreground/20">
          <p class="text-sm line-clamp-3">{{ commentToDelete.content }}</p>
        </div>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showDeleteDialog = false">
            取消
          </Button>
          <Button
            variant="destructive"
            :disabled="isDeleting !== null"
            @click="deleteComment"
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

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  app: {
    id: string
    title: string
  }
  author: {
    id: string
    username: string
    email: string
  }
}

interface CommentsResponse {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 狀態
const searchQuery = ref('')
const currentPage = ref(1)
const isDeleting = ref<string | null>(null)
const showDeleteDialog = ref(false)
const commentToDelete = ref<Comment | null>(null)

// 查詢參數
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: 20,
  search: searchQuery.value || undefined
}))

// 取得留言列表
const { data, pending, error, refresh } = await useFetch<CommentsResponse>('/api/admin/comments', {
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

// 確認刪除
const confirmDelete = (comment: Comment) => {
  commentToDelete.value = comment
  showDeleteDialog.value = true
}

// 刪除留言
const deleteComment = async () => {
  if (!commentToDelete.value) return

  isDeleting.value = commentToDelete.value.id

  try {
    await $fetch(`/api/admin/comments/${commentToDelete.value.id}`, {
      method: 'DELETE'
    })
    showDeleteDialog.value = false
    commentToDelete.value = null
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
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
