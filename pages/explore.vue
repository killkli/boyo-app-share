<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8 md:py-12">
      <!-- Page header - Brutalist Style -->
      <div class="mb-10 border-b-4 border-foreground pb-6">
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Explore</span>
        <h1 class="text-5xl md:text-6xl font-heading font-bold">
          探索應用
        </h1>
      </div>

      <!-- Filter and search section - Brutalist Style -->
      <div class="bg-card border-3 border-foreground shadow-brutal p-6 md:p-8 mb-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
          <!-- Search input -->
          <div class="md:col-span-2">
            <Label for="search" class="text-sm font-bold uppercase tracking-wide mb-2 block">搜尋</Label>
            <Input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="搜尋應用標題或描述..."
              class="text-base"
              @input="handleSearch"
            />
          </div>

          <!-- Category filter -->
          <div>
            <Label for="category" class="text-sm font-bold uppercase tracking-wide mb-2 block">分類</Label>
            <Select v-model="filters.category" @update:model-value="applyFilters">
              <SelectTrigger id="category">
                <SelectValue placeholder="所有分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">所有分類</SelectItem>
                <SelectItem value="game">遊戲</SelectItem>
                <SelectItem value="tool">工具</SelectItem>
                <SelectItem value="art">藝術</SelectItem>
                <SelectItem value="education">教育</SelectItem>
                <SelectItem value="demo">展示</SelectItem>
                <SelectItem value="experiment">實驗</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Sort -->
          <div>
            <Label for="sort" class="text-sm font-bold uppercase tracking-wide mb-2 block">排序</Label>
            <Select v-model="filters.sort" @update:model-value="applyFilters">
              <SelectTrigger id="sort">
                <SelectValue placeholder="最新" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最新</SelectItem>
                <SelectItem value="popular">熱門</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Clear filters button -->
        <div v-if="hasActiveFilters" class="mt-5 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            class="font-bold uppercase tracking-wide"
            @click="clearFilters"
          >
            清除篩選
          </Button>
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
            找到 <span class="font-bold text-primary">{{ total }}</span> 個應用
          </div>
        </div>

        <AppGrid
          :apps="apps"
          :current-page="currentPage"
          :total-pages="totalPages"
          :show-pagination="true"
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'default'
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
  author_username: string
  author_avatar?: string | null
}

const route = useRoute()
const router = useRouter()

const apps = ref<App[]>([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

const filters = ref({
  search: (route.query.search as string) || '',
  category: (route.query.category as string) || '',
  sort: (route.query.sort as string) || 'latest'
})

// 檢查是否有啟用的篩選條件
const hasActiveFilters = computed(() => {
  return filters.value.search !== '' ||
         filters.value.category !== '' ||
         filters.value.sort !== 'latest'
})

// 搜尋防抖
let searchTimeout: NodeJS.Timeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

// 套用篩選
const applyFilters = () => {
  currentPage.value = 1
  updateQueryParams()
  fetchApps()
}

// 清除篩選
const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    sort: 'latest'
  }
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

  if (filters.value.search) query.search = filters.value.search
  if (filters.value.category) query.category = filters.value.category
  if (filters.value.sort !== 'latest') query.sort = filters.value.sort
  if (currentPage.value > 1) query.page = currentPage.value.toString()

  router.replace({ query })
}

// 獲取 Apps
const fetchApps = async () => {
  try {
    loading.value = true

    const params: Record<string, any> = {
      page: currentPage.value,
      limit: 12,
      sort: filters.value.sort
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.category) params.category = filters.value.category

    const response = await $fetch<{
      apps: App[]
      total: number
      page: number
      totalPages: number
    }>('/api/apps', { params })

    apps.value = response.apps
    total.value = response.total
    currentPage.value = response.page
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('Failed to fetch apps:', error)
  } finally {
    loading.value = false
  }
}

// 監聽路由變化
watch(() => route.query, (newQuery) => {
  currentPage.value = parseInt(newQuery.page as string) || 1
  filters.value.search = (newQuery.search as string) || ''
  filters.value.category = (newQuery.category as string) || ''
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
