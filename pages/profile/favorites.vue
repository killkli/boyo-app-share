<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8 md:py-12">
      <!-- Page header - Brutalist Style -->
      <div class="mb-10 border-b-4 border-foreground pb-6">
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Profile / Favorites</span>
        <h1 class="text-5xl md:text-6xl font-heading font-bold">
          我的收藏
        </h1>
        <p class="mt-4 text-lg text-muted-foreground font-medium">
          你收藏的所有應用
        </p>
      </div>

      <!-- Filter section - Brutalist Style -->
      <div class="bg-card border-3 border-foreground shadow-brutal p-6 md:p-8 mb-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Sort -->
          <div>
            <Label for="sort" class="text-sm font-bold uppercase tracking-wide mb-2 block">排序</Label>
            <Select v-model="filters.sort" @update:model-value="applyFilters">
              <SelectTrigger id="sort">
                <SelectValue placeholder="最新收藏" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最新收藏</SelectItem>
                <SelectItem value="popular">最熱門</SelectItem>
                <SelectItem value="rating">評分最高</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Clear filters button -->
          <div class="flex items-end">
            <Button
              v-if="filters.sort !== 'latest'"
              variant="outline"
              size="sm"
              class="font-bold uppercase tracking-wide"
              @click="clearFilters"
            >
              重置排序
            </Button>
          </div>
        </div>
      </div>

      <!-- Loading state - Brutalist spinner -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block mb-4">
          <div class="w-12 h-12 border-4 border-foreground border-t-transparent animate-spin"></div>
        </div>
        <p class="text-sm font-bold uppercase tracking-wide text-muted-foreground">載入中</p>
      </div>

      <!-- Apps list -->
      <div v-else>
        <!-- Results count - Brutalist badge -->
        <div class="mb-6">
          <div class="inline-flex items-center gap-2 bg-muted border-2 border-foreground px-4 py-2 font-mono text-sm">
            共收藏 <span class="font-bold text-primary">{{ total }}</span> 個應用
          </div>
        </div>

        <AppGrid
          :apps="apps"
          :current-page="currentPage"
          :total-pages="totalPages"
          :show-pagination="true"
          empty-title="暫無收藏"
          empty-message="你還沒有收藏任何應用，快去探索吧！"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppGrid from '@/components/app/AppGrid.vue'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'default',
  middleware: 'auth' // 需要登入
})

interface App {
  id: string
  title: string
  description: string | null
  category: string | null
  tags: string[] | null
  thumbnail_s3_key: string | null
  view_count: number
  like_count: number
  avg_rating: number
  rating_count: number
  comment_count: number
  author_username: string
  author_avatar?: string | null
}

const route = useRoute()
const router = useRouter()
const { token } = useLegacyAuth()

const apps = ref<App[]>([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

const filters = ref({
  sort: (route.query.sort as string) || 'latest'
})

// 套用篩選
const applyFilters = () => {
  currentPage.value = 1
  updateQueryParams()
  fetchApps()
}

// 清除篩選
const clearFilters = () => {
  filters.value.sort = 'latest'
  applyFilters()
}

// 處理分頁變更
const handlePageChange = (page: number) => {
  currentPage.value = page
  updateQueryParams()
  fetchApps()
  // 滾動到頁面頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 更新 URL 查詢參數
const updateQueryParams = () => {
  const query: Record<string, string> = {}

  if (filters.value.sort !== 'latest') query.sort = filters.value.sort
  if (currentPage.value > 1) query.page = currentPage.value.toString()

  router.replace({ query })
}

// 獲取收藏的 Apps
const fetchApps = async () => {
  try {
    loading.value = true

    const params: Record<string, any> = {
      page: currentPage.value,
      limit: 12,
      sort: filters.value.sort
    }

    const response = await $fetch<{
      apps: App[]
      total: number
      page: number
      totalPages: number
    }>('/api/apps/favorites', {
      params,
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    apps.value = response.apps
    total.value = response.total
    currentPage.value = response.page
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('Failed to fetch favorite apps:', error)
  } finally {
    loading.value = false
  }
}

// 監聽路由變化
watch(() => route.query, (newQuery) => {
  currentPage.value = parseInt(newQuery.page as string) || 1
  filters.value.sort = (newQuery.sort as string) || 'latest'
  fetchApps()
}, { deep: true })

onMounted(() => {
  currentPage.value = parseInt(route.query.page as string) || 1
  fetchApps()
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
