<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 載入狀態 -->
    <div v-if="loading" class="container mx-auto px-4 py-16 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">載入中...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="container mx-auto px-4 py-16 text-center">
      <div class="max-w-md mx-auto">
        <svg class="w-24 h-24 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">找不到應用</h2>
        <p class="text-gray-600 mb-6">此應用可能已被刪除或不存在</p>
        <Button as-child>
          <NuxtLink to="/explore">探索其他應用</NuxtLink>
        </Button>
      </div>
    </div>

    <!-- 應用詳情 -->
    <div v-else-if="app" class="container mx-auto px-4 py-8">
      <!-- 返回按鈕 -->
      <Button variant="ghost" class="mb-4" @click="$router.back()">
        ← 返回
      </Button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左側：應用預覽 -->
        <div class="lg:col-span-2">
          <Card class="overflow-hidden">
            <CardHeader>
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <CardTitle class="text-3xl mb-2">{{ app.title }}</CardTitle>
                  <CardDescription class="text-base">
                    {{ app.description || '暫無描述' }}
                  </CardDescription>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex gap-2">
                  <!-- 收藏按鈕 -->
                  <FavoriteButton
                    :is-favorited="isFavorited"
                    :favorite-count="app.favorite_count || 0"
                    :is-authenticated="isAuthenticated"
                    :loading="favoriteSubmitting"
                    show-label
                    @toggle="handleToggleFavorite"
                  />

                  <!-- 編輯按鈕 (僅作者可見) -->
                  <Button
                    v-if="canEdit"
                    variant="outline"
                    size="sm"
                    as-child
                  >
                    <NuxtLink :to="`/edit/${app.id}`">
                      編輯
                    </NuxtLink>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <!-- App 預覽 -->
              <div class="mb-6">
                <AppPreview :html-content="htmlContent" />
              </div>

              <!-- 分類與標籤 -->
              <div class="flex flex-wrap gap-2 mb-6">
                <Badge v-if="app.category" variant="default">
                  {{ getCategoryLabel(app.category) }}
                </Badge>
                <Badge
                  v-for="tag in app.tags"
                  :key="tag"
                  variant="outline"
                >
                  {{ tag }}
                </Badge>
              </div>

              <!-- 評分區域 -->
              <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold text-lg">為這個 App 評分</h3>
                  <Rating
                    v-if="app.avg_rating && app.avg_rating > 0"
                    :rating="app.avg_rating"
                    :count="app.rating_count"
                    show-value
                  />
                </div>
                <Rating
                  :rating="userRating"
                  :interactive="isAuthenticated"
                  size="lg"
                  @rate="handleRate"
                />
                <p v-if="!isAuthenticated" class="text-sm text-gray-500 mt-2">
                  請登入後評分
                </p>
              </div>

              <!-- 統計資訊 -->
              <div class="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{{ app.view_count }} 次瀏覽</span>
                </div>

                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatDate(app.created_at) }}</span>
                </div>
              </div>

              <!-- 評論區域 -->
              <Comments
                :comments="comments"
                :loading="commentsLoading"
                :is-authenticated="isAuthenticated"
                :total-count="app.comment_count || 0"
                @submit="handleSubmitComment"
              />
            </CardContent>
          </Card>
        </div>

        <!-- 右側：作者資訊與操作 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 作者資訊 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">作者</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex items-center gap-3">
                <Avatar class="w-12 h-12">
                  <AvatarImage
                    v-if="app.author_avatar"
                    :src="app.author_avatar"
                    :alt="app.author_username"
                  />
                  <AvatarFallback>{{ getInitials(app.author_username) }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-semibold">{{ app.author_username }}</p>
                  <p class="text-sm text-gray-600">{{ app.author_email }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 檔案資訊 -->
          <Card v-if="app.file_manifest">
            <CardHeader>
              <CardTitle class="text-lg">檔案列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2 text-sm">
                <div
                  v-for="file in app.file_manifest.files"
                  :key="file.path"
                  class="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span class="truncate flex-1 mr-2">{{ file.path }}</span>
                  <span class="text-gray-500 text-xs">{{ formatFileSize(file.size) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 上傳類型 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">上傳方式</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">
                {{ getUploadTypeLabel(app.upload_type) }}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPreview from '@/components/app/AppPreview.vue'
import Rating from '@/components/common/Rating.vue'
import Comments from '@/components/common/Comments.vue'
import FavoriteButton from '@/components/common/FavoriteButton.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

definePageMeta({
  layout: 'default'
})

interface Comment {
  id: string
  content: string
  username: string
  user_avatar?: string | null
  created_at: string
}

interface App {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  tags: string[]
  upload_type: string
  html_s3_key: string
  file_manifest: {
    files: Array<{
      path: string
      size: number
      type: string
    }>
  } | null
  view_count: number
  like_count: number
  avg_rating?: number
  rating_count?: number
  comment_count?: number
  favorite_count?: number
  created_at: string
  author_username: string
  author_email: string
  author_avatar?: string | null
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const app = ref<App | null>(null)
const htmlContent = ref('')
const loading = ref(true)
const error = ref(false)

// 互動狀態
const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const userRating = ref<number>(0)
const isFavorited = ref(false)
const ratingSubmitting = ref(false)
const favoriteSubmitting = ref(false)

// 獲取目前使用者 (用於判斷是否可編輯)
const { user, token } = useAuth()

// 判斷是否已登入
const isAuthenticated = computed(() => !!user.value)

// 判斷是否可編輯
const canEdit = computed(() => {
  if (!user.value || !app.value) return false
  return user.value.id === app.value.user_id
})

// 獲取 App 詳情
const fetchApp = async () => {
  try {
    loading.value = true
    error.value = false

    const appId = route.params.id as string
    const response = await $fetch<{ app: App }>(`/api/apps/${appId}`)
    app.value = response.app

    // 載入 HTML 內容
    await fetchHtmlContent()
  } catch (err) {
    console.error('Failed to fetch app:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 獲取 HTML 內容
const fetchHtmlContent = async () => {
  if (!app.value) return

  try {
    const s3Url = `${config.public.s3BaseUrl}/${app.value.html_s3_key}`
    const response = await fetch(s3Url)
    htmlContent.value = await response.text()
  } catch (err) {
    console.error('Failed to fetch HTML content:', err)
    htmlContent.value = '<p>無法載入預覽</p>'
  }
}

// 輔助函數
const getInitials = (username: string) => {
  return username.slice(0, 2).toUpperCase()
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    game: '遊戲',
    tool: '工具',
    art: '藝術',
    education: '教育',
    other: '其他'
  }
  return labels[category] || category
}

const getUploadTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    paste: '剪貼簿',
    file: '單檔上傳',
    zip: 'ZIP 壓縮檔'
  }
  return labels[type] || type
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 獲取評論
const fetchComments = async () => {
  if (!app.value) return

  try {
    commentsLoading.value = true
    const response = await $fetch<{ comments: Comment[] }>(`/api/apps/${app.value.id}/comments`)
    comments.value = response.comments
  } catch (err) {
    console.error('Failed to fetch comments:', err)
  } finally {
    commentsLoading.value = false
  }
}

// 提交評論
const handleSubmitComment = async (content: string) => {
  if (!app.value || !token.value) return

  try {
    await $fetch(`/api/apps/${app.value.id}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: { content }
    })

    // 重新載入評論
    await fetchComments()

    // 更新評論數量
    if (app.value.comment_count !== undefined) {
      app.value.comment_count += 1
    }
  } catch (err) {
    console.error('Failed to submit comment:', err)
    alert('發送評論失敗，請稍後再試')
  }
}

// 提交評分
const handleRate = async (rating: number) => {
  if (!app.value || !token.value) return

  try {
    ratingSubmitting.value = true
    const response = await $fetch<{ avgRating: number, ratingCount: number }>(`/api/apps/${app.value.id}/rate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: { rating }
    })

    // 更新使用者評分
    userRating.value = rating

    // 更新平均評分
    if (app.value) {
      app.value.avg_rating = response.avgRating
      app.value.rating_count = response.ratingCount
    }
  } catch (err) {
    console.error('Failed to submit rating:', err)
    alert('評分失敗，請稍後再試')
  } finally {
    ratingSubmitting.value = false
  }
}

// 切換收藏
const handleToggleFavorite = async () => {
  if (!app.value || !token.value) return

  try {
    favoriteSubmitting.value = true
    const response = await $fetch<{ isFavorited: boolean, favoriteCount: number }>(`/api/apps/${app.value.id}/favorite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    // 更新收藏狀態
    isFavorited.value = response.isFavorited

    // 更新收藏數量
    if (app.value) {
      app.value.favorite_count = response.favoriteCount
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
    alert('操作失敗，請稍後再試')
  } finally {
    favoriteSubmitting.value = false
  }
}

onMounted(async () => {
  await fetchApp()
  await fetchComments()
})
</script>
