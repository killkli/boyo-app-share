<template>
  <div class="min-h-screen bg-background">
    <!-- 載入狀態 - Brutalist -->
    <div v-if="loading" class="container mx-auto px-4 py-16 text-center">
      <div class="inline-block mb-4">
        <div class="w-12 h-12 border-4 border-foreground border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-bold uppercase tracking-wide text-muted-foreground">載入中</p>
    </div>

    <!-- 錯誤狀態 - Brutalist -->
    <div v-else-if="error" class="container mx-auto px-4 py-16 text-center">
      <div class="max-w-md mx-auto border-3 border-red-500 bg-red-50 p-8 shadow-brutal">
        <div class="w-16 h-16 border-3 border-red-500 bg-red-100 mx-auto mb-4"></div>
        <h2 class="text-2xl font-bold mb-2 uppercase tracking-wide">找不到應用</h2>
        <p class="text-muted-foreground mb-6">此應用可能已被刪除或不存在</p>
        <Button as-child>
          <NuxtLink to="/explore">探索其他應用</NuxtLink>
        </Button>
      </div>
    </div>

    <!-- 應用詳情 - Brutalist -->
    <div v-else-if="app" class="container mx-auto px-4 py-8">
      <!-- 返回按鈕 -->
      <Button variant="ghost" class="mb-4 font-bold uppercase tracking-wide" @click="$router.back()">
        ← 返回
      </Button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左側：應用預覽 -->
        <div class="lg:col-span-2">
          <Card class="border-3 border-foreground shadow-brutal-lg">
            <!-- 7.1: 頂部信息區 -->
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <CardTitle class="text-3xl font-bold mb-3">{{ app.title }}</CardTitle>
                  <CardDescription class="text-base">
                    {{ app.description || '暫無描述' }}
                  </CardDescription>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex gap-2 flex-shrink-0">
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
                    class="font-bold uppercase tracking-wide"
                    as-child
                  >
                    <NuxtLink :to="`/edit/${app.id}`">
                      編輯
                    </NuxtLink>
                  </Button>
                </div>
              </div>

              <!-- Meta 信息 -->
              <div class="flex items-center gap-6 text-sm font-mono border-t-2 border-foreground pt-4 mt-4">
                <div class="flex items-center gap-2">
                  <span class="font-bold">{{ app.view_count }}</span>
                  <span class="text-muted-foreground">次瀏覽</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground">{{ formatDate(app.created_at) }}</span>
                </div>
              </div>

              <!-- 操作按鈕組 -->
              <div class="flex flex-wrap gap-3 border-t-2 border-foreground pt-4 mt-4">
                <!-- 開啟APP按鈕 -->
                <Button
                  variant="default"
                  size="sm"
                  class="font-bold uppercase tracking-wide flex-1 min-w-[120px]"
                  @click="openAppInNewTab"
                >
                  開啟 APP ↗
                </Button>

                <!-- 分享按鈕 -->
                <Button
                  variant="outline"
                  size="sm"
                  class="font-bold uppercase tracking-wide flex-1 min-w-[120px]"
                  @click="shareApp"
                >
                  {{ shareButtonText }}
                </Button>
              </div>
            </CardHeader>

            <CardContent class="p-0">
              <!-- 7.2: 預覽區域 -->
              <div class="relative border-b-3 border-foreground">
                <AppPreview :html-content="htmlContent" />
                <!-- 全屏按鈕 -->
                <Button
                  variant="outline"
                  size="sm"
                  class="absolute top-4 right-4 font-bold uppercase tracking-wide z-10"
                  @click="toggleFullscreen"
                >
                  {{ isFullscreen ? '退出全屏' : '全屏' }}
                </Button>
              </div>

              <!-- 分類與標籤 -->
              <div class="flex flex-wrap gap-2 p-6 border-b-3 border-foreground">
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
              <div class="p-6 bg-muted border-b-3 border-foreground">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-lg uppercase tracking-wide">評分</h3>
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
                <p v-if="!isAuthenticated" class="text-sm text-muted-foreground mt-2 font-mono">
                  請登入後評分
                </p>
              </div>

              <!-- 7.3: 評論區域 - 使用分隔線而非卡片邊框 -->
              <div class="p-6">
                <Comments
                  :comments="comments"
                  :loading="commentsLoading"
                  :is-authenticated="isAuthenticated"
                  :total-count="app.comment_count || 0"
                  @submit="handleSubmitComment"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- 右側：作者資訊與操作 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 作者資訊 -->
          <Card class="border-3 border-foreground shadow-brutal">
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <CardTitle class="text-lg font-bold uppercase tracking-wide">作者</CardTitle>
            </CardHeader>
            <CardContent class="pt-6">
              <div class="flex items-center gap-3">
                <!-- 方形頭像 -->
                <div class="w-12 h-12 border-2 border-foreground bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground uppercase">
                  {{ getInitials(app.author_username) }}
                </div>
                <div>
                  <p class="font-bold">{{ app.author_username }}</p>
                  <p class="text-sm text-muted-foreground font-mono">{{ app.author_email }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 檔案資訊 -->
          <Card v-if="app.file_manifest" class="border-3 border-foreground shadow-brutal">
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <CardTitle class="text-lg font-bold uppercase tracking-wide">檔案列表</CardTitle>
            </CardHeader>
            <CardContent class="pt-6">
              <div class="space-y-2 text-sm font-mono">
                <div
                  v-for="file in app.file_manifest.files"
                  :key="file.path"
                  class="flex items-center justify-between py-2 border-b-2 border-foreground last:border-0"
                >
                  <span class="truncate flex-1 mr-2">{{ file.path }}</span>
                  <span class="text-muted-foreground text-xs">{{ formatFileSize(file.size) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 上傳類型 -->
          <Card class="border-3 border-foreground shadow-brutal">
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <CardTitle class="text-lg font-bold uppercase tracking-wide">上傳方式</CardTitle>
            </CardHeader>
            <CardContent class="pt-6">
              <Badge variant="outline" class="font-mono">
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
import { useAuth } from '~/composables/useAuth'
import AppPreview from '@/components/app/AppPreview.vue'
import Rating from '@/components/common/Rating.vue'
import Comments from '@/components/common/Comments.vue'
import FavoriteButton from '@/components/common/FavoriteButton.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  user_rating?: number | null
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
const isFullscreen = ref(false)
const shareButtonText = ref('分享')

// 獲取目前使用者 (用於判斷是否可編輯)
const { user, token } = useAuth()

// 判斷是否已登入
const isAuthenticated = computed(() => !!user.value)

// 判斷是否可編輯
const canEdit = computed(() => {
  if (!user.value || !app.value) return false
  return user.value.id === app.value.user_id
})

// 計算APP的S3 URL
const appUrl = computed(() => {
  if (!app.value) return ''
  return `${config.public.s3BaseUrl}/${app.value.html_s3_key}`
})

// 開啟APP在新分頁
const openAppInNewTab = () => {
  if (appUrl.value) {
    window.open(appUrl.value, '_blank', 'noopener,noreferrer')
  }
}

// 分享APP
const shareApp = async () => {
  const shareUrl = window.location.href

  try {
    // 嘗試使用 Clipboard API
    await navigator.clipboard.writeText(shareUrl)
    shareButtonText.value = '已複製！'
    setTimeout(() => {
      shareButtonText.value = '分享'
    }, 2000)
  } catch (err) {
    // 降級方案：使用傳統方法
    const textArea = document.createElement('textarea')
    textArea.value = shareUrl
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      shareButtonText.value = '已複製！'
      setTimeout(() => {
        shareButtonText.value = '分享'
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('複製失敗，請手動複製連結')
    }
    document.body.removeChild(textArea)
  }
}

// 切換全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // 這裡可以加入實際全屏邏輯
  if (isFullscreen.value) {
    // 進入全屏
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// 獲取 App 詳情
const fetchApp = async () => {
  try {
    loading.value = true
    error.value = false

    const appId = route.params.id as string
    const response = await $fetch<{ app: App }>(`/api/apps/${appId}`)
    app.value = response.app

    // 初始化用戶評分（如果有的話）
    if (app.value.user_rating) {
      userRating.value = app.value.user_rating
    }

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
    demo: '展示',
    experiment: '實驗',
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

<style scoped>
/* Add spin animation for loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
