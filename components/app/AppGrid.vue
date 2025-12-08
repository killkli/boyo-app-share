<template>
  <div>
    <!-- App 網格 -->
    <div v-if="apps.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AppCard
        v-for="app in apps"
        :key="app.id"
        :app="app"
      />
    </div>

    <!-- 空狀態 -->
    <div v-else class="text-center py-16">
      <svg
        class="w-24 h-24 mx-auto text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ emptyTitle }}</h3>
      <p class="text-gray-500">{{ emptyMessage }}</p>
    </div>

    <!-- 載入更多 / 分頁 -->
    <div v-if="showPagination && totalPages > 1" class="mt-8 flex justify-center gap-2">
      <Button
        variant="outline"
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
      >
        上一頁
      </Button>

      <div class="flex items-center gap-1">
        <template v-for="page in visiblePages" :key="page">
          <Button
            v-if="typeof page === 'number'"
            :variant="page === currentPage ? 'default' : 'outline'"
            @click="$emit('page-change', page)"
          >
            {{ page }}
          </Button>
          <span v-else class="px-2">...</span>
        </template>
      </div>

      <Button
        variant="outline"
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', currentPage + 1)"
      >
        下一頁
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppCard from './AppCard.vue'
import { Button } from '@/components/ui/button'

interface App {
  id: string
  title: string
  description: string | null
  category: string | null
  tags: string[] | null
  thumbnail_s3_key: string | null
  view_count: number
  like_count: number
  author_username: string
  author_avatar?: string | null
}

const props = withDefaults(defineProps<{
  apps: App[]
  currentPage?: number
  totalPages?: number
  showPagination?: boolean
  emptyTitle?: string
  emptyMessage?: string
}>(), {
  currentPage: 1,
  totalPages: 1,
  showPagination: true,
  emptyTitle: '暫無 App',
  emptyMessage: '目前還沒有任何 App，成為第一個上傳者吧！'
})

defineEmits<{
  'page-change': [page: number]
}>()

// 計算可見的分頁按鈕
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    // 如果總頁數 <= 7，顯示全部
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 否則顯示: 1 ... current-1 current current+1 ... total
    pages.push(1)

    if (current > 3) {
      pages.push('...')
    }

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('...')
    }

    pages.push(total)
  }

  return pages
})
</script>
