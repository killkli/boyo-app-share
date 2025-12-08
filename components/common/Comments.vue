<template>
  <div class="space-y-6">
    <!-- 評論表單 -->
    <div v-if="isAuthenticated" class="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <form @submit.prevent="handleSubmit">
        <Textarea
          v-model="newComment"
          placeholder="分享你的想法..."
          class="mb-3"
          :disabled="submitting"
          rows="3"
        />
        <div class="flex justify-end">
          <Button
            type="submit"
            :disabled="!newComment.trim() || submitting"
          >
            {{ submitting ? '發送中...' : '發送評論' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- 未登入提示 -->
    <div v-else class="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 text-center">
      <p class="text-gray-600 dark:text-gray-400 mb-3">請登入後發表評論</p>
      <Button @click="navigateTo('/login')">登入</Button>
    </div>

    <!-- 評論列表 -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">評論 ({{ totalCount }})</h3>

      <!-- 載入中 -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="flex gap-3">
            <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>尚無評論，成為第一個留言的人吧！</p>
      </div>

      <!-- 評論項目 -->
      <div v-else class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex gap-3 pb-4 border-b last:border-b-0"
        >
          <!-- 頭像 -->
          <Avatar class="w-10 h-10">
            <AvatarImage
              v-if="comment.user_avatar"
              :src="comment.user_avatar"
              :alt="comment.username"
            />
            <AvatarFallback>{{ getInitials(comment.username) }}</AvatarFallback>
          </Avatar>

          <!-- 內容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-sm">{{ comment.username }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(comment.created_at) }}
              </span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ comment.content }}
            </p>
          </div>
        </div>
      </div>

      <!-- 載入更多 -->
      <div v-if="hasMore" class="text-center">
        <Button
          variant="outline"
          @click="$emit('load-more')"
          :disabled="loading"
        >
          載入更多
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface Comment {
  id: string
  content: string
  username: string
  user_avatar?: string | null
  created_at: string
}

interface Props {
  comments: Comment[]
  loading?: boolean
  isAuthenticated?: boolean
  totalCount?: number
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  isAuthenticated: false,
  totalCount: 0,
  hasMore: false
})

const emit = defineEmits<{
  submit: [content: string]
  'load-more': []
}>()

const newComment = ref('')
const submitting = ref(false)

// 處理提交
const handleSubmit = async () => {
  if (!newComment.value.trim() || submitting.value) return

  submitting.value = true
  try {
    emit('submit', newComment.value.trim())
    newComment.value = ''
  } finally {
    submitting.value = false
  }
}

// 取得使用者名稱首字母
const getInitials = (username: string) => {
  return username.slice(0, 2).toUpperCase()
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小於 1 分鐘
  if (diff < 60 * 1000) {
    return '剛剛'
  }

  // 小於 1 小時
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes} 分鐘前`
  }

  // 小於 1 天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} 小時前`
  }

  // 小於 7 天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} 天前`
  }

  // 顯示完整日期
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>
