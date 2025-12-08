<template>
  <Card class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" @click="navigateToApp">
    <!-- 縮圖 -->
    <div class="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
      <img
        v-if="app.thumbnail_s3_key"
        :src="getThumbnailUrl(app.thumbnail_s3_key)"
        :alt="app.title"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>

      <!-- 分類標籤 -->
      <Badge
        v-if="app.category"
        class="absolute top-2 right-2"
        :variant="getCategoryVariant(app.category)"
      >
        {{ getCategoryLabel(app.category) }}
      </Badge>
    </div>

    <!-- 內容 -->
    <CardHeader class="pb-3">
      <CardTitle class="text-lg line-clamp-1">{{ app.title }}</CardTitle>
      <CardDescription class="line-clamp-2">
        {{ app.description || '暫無描述' }}
      </CardDescription>
    </CardHeader>

    <CardContent class="pb-3">
      <!-- 標籤列表 -->
      <div v-if="app.tags && app.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
        <Badge
          v-for="tag in app.tags.slice(0, 3)"
          :key="tag"
          variant="outline"
          class="text-xs"
        >
          {{ tag }}
        </Badge>
        <Badge
          v-if="app.tags.length > 3"
          variant="outline"
          class="text-xs"
        >
          +{{ app.tags.length - 3 }}
        </Badge>
      </div>

      <!-- 評分 -->
      <div v-if="app.avg_rating && app.avg_rating > 0" class="mb-3">
        <Rating
          :rating="app.avg_rating"
          :count="app.rating_count"
          size="sm"
          show-value
        />
      </div>

      <!-- 作者資訊與統計 -->
      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center gap-2">
          <Avatar class="w-6 h-6">
            <AvatarImage
              v-if="app.author_avatar"
              :src="app.author_avatar"
              :alt="app.author_username"
            />
            <AvatarFallback>{{ getInitials(app.author_username) }}</AvatarFallback>
          </Avatar>
          <span class="text-xs">{{ app.author_username }}</span>
        </div>

        <div class="flex items-center gap-3 text-xs">
          <!-- 瀏覽次數 -->
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{{ formatCount(app.view_count) }}</span>
          </div>

          <!-- 評論數 -->
          <div v-if="app.comment_count" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{{ formatCount(app.comment_count) }}</span>
          </div>

          <!-- 收藏次數 -->
          <div v-if="app.favorite_count" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{{ formatCount(app.favorite_count) }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Rating from '@/components/common/Rating.vue'

interface App {
  id: string
  title: string
  description: string | null
  category: string | null
  tags: string[] | null
  thumbnail_s3_key: string | null
  view_count: number
  like_count: number
  avg_rating?: number
  rating_count?: number
  comment_count?: number
  favorite_count?: number
  author_username: string
  author_avatar?: string | null
}

const props = defineProps<{
  app: App
}>()

const config = useRuntimeConfig()

// 取得縮圖 URL
const getThumbnailUrl = (s3Key: string) => {
  return `${config.public.s3BaseUrl}/${s3Key}`
}

// 取得使用者名稱首字母
const getInitials = (username: string) => {
  return username.slice(0, 2).toUpperCase()
}

// 格式化數字（1000 → 1K）
const formatCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

// 取得分類標籤樣式
const getCategoryVariant = (category: string) => {
  const variants: Record<string, any> = {
    game: 'default',
    tool: 'secondary',
    art: 'outline',
    education: 'destructive'
  }
  return variants[category] || 'default'
}

// 取得分類顯示名稱
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

// 導航到 App 詳情頁
const navigateToApp = () => {
  navigateTo(`/app/${props.app.id}`)
}
</script>
