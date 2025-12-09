<template>
  <div class="min-h-screen bg-background">
    <!-- Hero Section - Brutalist Style -->
    <section class="border-b-4 border-foreground bg-background py-16 md:py-24 relative overflow-hidden">
      <!-- Optional subtle grid pattern background -->
      <div class="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="max-w-4xl mx-auto">
          <!-- Main Heading - Bold Typography -->
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6 animate-slide-up">
            分享你的<br />
            HTML 創意<br />
            <span class="text-primary">給世界</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl animate-slide-up delay-75">
            {{ config.public.appDescription }}
          </p>

          <!-- CTA Buttons - Brutalist Style -->
          <div class="flex flex-col sm:flex-row gap-4 animate-slide-up delay-100">
            <Button
              size="lg"
              class="text-base"
              as-child
            >
              <NuxtLink to="/explore">
                探索應用
              </NuxtLink>
            </Button>
            <Button
              size="lg"
              variant="outline"
              class="text-base"
              as-child
            >
              <NuxtLink to="/create">
                建立應用
              </NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Apps Section -->
    <div class="container mx-auto px-4 py-12 md:py-16">
      <!-- Latest Apps -->
      <section class="mb-16">
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b-4 border-foreground pb-4 mb-8 gap-4">
          <div>
            <span class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1 block">Latest</span>
            <h2 class="text-3xl md:text-4xl font-bold">
              最新應用
            </h2>
          </div>
          <NuxtLink
            to="/explore?sort=latest"
            class="font-bold uppercase text-sm tracking-wide hover:text-primary transition-colors group"
          >
            查看全部
            <span class="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
          </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-if="latestLoading" class="text-center py-16">
          <div class="inline-block mb-4">
            <div class="w-12 h-12 border-4 border-foreground border-t-transparent animate-spin"></div>
          </div>
          <p class="text-sm font-bold uppercase tracking-wide text-muted-foreground">載入中</p>
        </div>

        <!-- Apps Grid -->
        <AppGrid
          v-else
          :apps="latestApps"
          :show-pagination="false"
          empty-title="暫無應用"
          empty-message="還沒有人上傳應用，成為第一個吧！"
        />
      </section>

      <!-- Popular Apps -->
      <section class="mb-12">
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b-4 border-foreground pb-4 mb-8 gap-4">
          <div>
            <span class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1 block">Popular</span>
            <h2 class="text-3xl md:text-4xl font-bold">
              熱門應用
            </h2>
          </div>
          <NuxtLink
            to="/explore?sort=popular"
            class="font-bold uppercase text-sm tracking-wide hover:text-primary transition-colors group"
          >
            查看全部
            <span class="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
          </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-if="popularLoading" class="text-center py-16">
          <div class="inline-block mb-4">
            <div class="w-12 h-12 border-4 border-foreground border-t-transparent animate-spin"></div>
          </div>
          <p class="text-sm font-bold uppercase tracking-wide text-muted-foreground">載入中</p>
        </div>

        <!-- Apps Grid -->
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

const config = useRuntimeConfig()

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

// Fetch latest apps
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

// Fetch popular apps
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
