<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">探索應用</h1>

      <!-- 篩選與搜尋 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜尋 -->
          <div class="md:col-span-2">
            <Label for="search">搜尋</Label>
            <Input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="搜尋應用標題或描述..."
              @input="handleSearch"
            />
          </div>

          <!-- 分類篩選 -->
          <div>
            <Label for="category">分類</Label>
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
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 排序 -->
          <div>
            <Label for="sort">排序</Label>
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

        <!-- 清除篩選 -->
        <div v-if="hasActiveFilters" class="mt-4">
          <Button variant="ghost" size="sm" @click="clearFilters">
            清除所有篩選
          </Button>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">載入中...</p>
      </div>

      <!-- App 列表 -->
      <div v-else>
        <!-- 結果統計 -->
        <div class="mb-4 text-gray-600">
          找到 {{ total }} 個應用
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
