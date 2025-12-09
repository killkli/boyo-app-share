<template>
  <div class="min-h-screen bg-paper overflow-hidden">
    <!-- Hero Section with playful collage aesthetic -->
    <div class="relative bg-gradient-to-br from-[hsl(var(--color-sunshine))] via-[hsl(var(--color-coral))] to-[hsl(var(--color-lavender))] overflow-hidden">
      <!-- Decorative floating shapes -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-10 left-[10%] w-32 h-32 rounded-full bg-white/40 animate-float"></div>
        <div class="absolute top-32 right-[15%] w-24 h-24 rounded-lg rotate-12 bg-white/30 animate-float" style="animation-delay: 0.5s;"></div>
        <div class="absolute bottom-20 left-[20%] w-40 h-40 rounded-full bg-white/30 animate-float" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-32 right-[25%] w-28 h-28 rounded-lg -rotate-12 bg-white/40 animate-float" style="animation-delay: 1.5s;"></div>
      </div>

      <div class="container mx-auto px-4 py-20 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <!-- Main title with stagger animation -->
          <div class="animate-slide-up-fade">
            <h1 class="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white drop-shadow-lg">
              {{ config.public.appName }}
            </h1>
          </div>

          <div class="animate-slide-up-fade" style="animation-delay: 0.1s;">
            <p class="text-xl md:text-2xl mb-10 text-white/95 font-medium max-w-2xl mx-auto leading-relaxed">
              {{ config.public.appDescription }}
            </p>
          </div>

          <!-- CTA buttons with playful styling -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-fade" style="animation-delay: 0.2s;">
            <Button
              size="lg"
              class="bg-white text-[hsl(var(--foreground))] hover:bg-white/90 shadow-playful-lg hover:shadow-playful transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 font-semibold rounded-2xl"
              as-child
            >
              <NuxtLink to="/explore">
                🔍 探索應用
              </NuxtLink>
            </Button>
            <Button
              size="lg"
              class="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 shadow-playful-lg hover:shadow-playful transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 font-semibold rounded-2xl"
              as-child
            >
              <NuxtLink to="/create">
                ✨ 建立應用
              </NuxtLink>
            </Button>
          </div>
        </div>
      </div>

      <!-- Wave divider -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="w-full h-16 md:h-24">
          <path d="M0,0 C150,80 350,0 600,50 C850,100 1050,20 1200,60 L1200,120 L0,120 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </div>

    <!-- Featured Apps Section with staggered grid -->
    <div class="container mx-auto px-4 py-12 md:py-20">
      <!-- Latest Apps -->
      <section class="mb-20">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 class="text-4xl md:text-5xl font-bold mb-2">
              最新應用
            </h2>
            <div class="h-2 w-24 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full"></div>
          </div>
          <Button
            variant="ghost"
            class="font-semibold text-lg hover:text-[hsl(var(--primary))] transition-colors group"
            as-child
          >
            <NuxtLink to="/explore?sort=latest">
              查看全部
              <span class="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
            </NuxtLink>
          </Button>
        </div>

        <div v-if="latestLoading" class="text-center py-20">
          <div class="inline-block animate-bounce-gentle">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"></div>
          </div>
          <p class="mt-4 text-lg font-medium text-muted-foreground">載入中...</p>
        </div>

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
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 class="text-4xl md:text-5xl font-bold mb-2">
              熱門應用
            </h2>
            <div class="h-2 w-24 bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--accent))] rounded-full"></div>
          </div>
          <Button
            variant="ghost"
            class="font-semibold text-lg hover:text-[hsl(var(--secondary))] transition-colors group"
            as-child
          >
            <NuxtLink to="/explore?sort=popular">
              查看全部
              <span class="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
            </NuxtLink>
          </Button>
        </div>

        <div v-if="popularLoading" class="text-center py-20">
          <div class="inline-block animate-bounce-gentle">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--accent))]"></div>
          </div>
          <p class="mt-4 text-lg font-medium text-muted-foreground">載入中...</p>
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
