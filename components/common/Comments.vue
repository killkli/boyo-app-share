<template>
  <div class="space-y-6">
    <!-- 標題 -->
    <h3 class="text-2xl font-bold uppercase tracking-wide border-b-3 border-foreground pb-3">
      評論 ({{ totalCount }})
    </h3>

    <!-- 評論表單 - Brutalist -->
    <div v-if="isAuthenticated" class="border-3 border-foreground p-6 bg-muted shadow-brutal">
      <form @submit.prevent="handleSubmit">
        <Textarea
          v-model="newComment"
          placeholder="分享你的想法..."
          class="mb-4 border-3 border-foreground shadow-brutal-sm font-mono"
          :disabled="submitting"
          rows="4"
        />
        <div class="flex justify-end">
          <Button
            type="submit"
            :disabled="!newComment.trim() || submitting"
            class="font-bold uppercase tracking-wide"
          >
            {{ submitting ? '發送中...' : '發送評論' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- 未登入提示 - Brutalist -->
    <div v-else class="border-3 border-foreground p-8 bg-muted text-center shadow-brutal">
      <div class="w-16 h-16 border-3 border-foreground bg-background mx-auto mb-4 flex items-center justify-center">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <p class="text-foreground mb-4 font-bold uppercase tracking-wide">請登入後發表評論</p>
      <Button @click="navigateTo('/login')" class="font-bold uppercase tracking-wide">登入</Button>
    </div>

    <!-- 評論列表 -->
    <div class="space-y-4">
      <!-- 載入中 - Brutalist -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="border-3 border-foreground p-4 bg-muted shadow-brutal-sm">
          <div class="flex gap-4">
            <div class="w-12 h-12 border-2 border-foreground bg-background animate-pulse" />
            <div class="flex-1 space-y-3">
              <div class="h-4 bg-background border-2 border-foreground w-1/4 animate-pulse" />
              <div class="h-4 bg-background border-2 border-foreground w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 - Brutalist -->
      <div v-else-if="comments.length === 0" class="border-3 border-foreground p-12 bg-muted text-center shadow-brutal">
        <div class="w-20 h-20 border-3 border-foreground bg-background mx-auto mb-6 flex items-center justify-center">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="font-bold uppercase tracking-wide text-lg">尚無評論</p>
        <p class="text-muted-foreground mt-2 font-mono">成為第一個留言的人吧！</p>
      </div>

      <!-- 評論項目 - Brutalist -->
      <div v-else class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="border-3 border-foreground p-5 bg-background shadow-brutal-sm hover:shadow-brutal transition-shadow"
        >
          <div class="flex gap-4">
            <!-- 方形頭像 - Brutalist -->
            <div class="w-12 h-12 border-3 border-foreground bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground uppercase flex-shrink-0">
              {{ getInitials(comment.username) }}
            </div>

            <!-- 內容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-3 pb-2 border-b-2 border-foreground">
                <span class="font-bold text-base uppercase tracking-wide">{{ comment.username }}</span>
                <span class="text-xs text-muted-foreground font-mono">
                  {{ formatDate(comment.created_at) }}
                </span>
              </div>
              <p class="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {{ comment.content }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 載入更多 - Brutalist -->
      <div v-if="hasMore" class="text-center pt-4">
        <Button
          variant="outline"
          @click="$emit('load-more')"
          :disabled="loading"
          class="font-bold uppercase tracking-wide shadow-brutal-sm hover:shadow-brutal"
        >
          載入更多評論
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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
