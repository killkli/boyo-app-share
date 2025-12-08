<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <div class="container mx-auto px-4 py-16">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-5xl font-bold mb-4">
            AI App Share
          </h1>
          <p class="text-xl mb-8 text-blue-100">
            分享你的創意 HTML 應用，探索無限可能
          </p>
          <div class="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" as-child>
              <NuxtLink to="/explore">
                探索應用
              </NuxtLink>
            </Button>
            <Button size="lg" as-child>
              <NuxtLink to="/create">
                建立應用
              </NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Apps Section -->
    <div class="container mx-auto px-4 py-12">
      <!-- 最新應用 -->
      <section class="mb-16">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-gray-900">最新應用</h2>
          <Button variant="ghost" as-child>
            <NuxtLink to="/explore?sort=latest">查看全部 →</NuxtLink>
          </Button>
        </div>

        <div v-if="latestLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <AppGrid
          v-else
          :apps="latestApps"
          :show-pagination="false"
          empty-title="暫無應用"
          empty-message="還沒有人上傳應用，成為第一個吧！"
        />
      </section>

      <!-- 熱門應用 -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-gray-900">熱門應用</h2>
          <Button variant="ghost" as-child>
            <NuxtLink to="/explore?sort=popular">查看全部 →</NuxtLink>
          </Button>
        </div>

        <div v-if="popularLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <AppGrid
          v-else
          :apps="popularApps"
          :show-pagination="false"
          empty-title="暫無熱門應用"
          empty-message="快來探索更多應用！"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppGrid from '@/components/app/AppGrid.vue'
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

const latestApps = ref<App[]>([])
const popularApps = ref<App[]>([])
const latestLoading = ref(true)
const popularLoading = ref(true)

// 獲取最新應用
const fetchLatestApps = async () => {
  try {
    latestLoading.value = true
    const response = await $fetch<{ apps: App[] }>('/api/apps', {
      params: {
        sort: 'latest',
        limit: 8
      }
    })
    latestApps.value = response.apps
  } catch (error) {
    console.error('Failed to fetch latest apps:', error)
  } finally {
    latestLoading.value = false
  }
}

// 獲取熱門應用
const fetchPopularApps = async () => {
  try {
    popularLoading.value = true
    const response = await $fetch<{ apps: App[] }>('/api/apps', {
      params: {
        sort: 'popular',
        limit: 8
      }
    })
    popularApps.value = response.apps
  } catch (error) {
    console.error('Failed to fetch popular apps:', error)
  } finally {
    popularLoading.value = false
  }
}

onMounted(() => {
  fetchLatestApps()
  fetchPopularApps()
})
</script>
