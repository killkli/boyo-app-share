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

              <!-- 統計資訊 -->
              <div class="flex items-center gap-6 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{{ app.view_count }} 次瀏覽</span>
                </div>

                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{{ app.like_count }} 個讚</span>
                </div>

                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatDate(app.created_at) }}</span>
                </div>
              </div>
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

definePageMeta({
  layout: 'default'
})

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

// 獲取目前使用者 (用於判斷是否可編輯)
const { user } = useAuth()

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

onMounted(() => {
  fetchApp()
})
</script>
