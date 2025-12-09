<template>
  <article
    class="group border-2 md:border-3 border-foreground bg-card overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-md shadow-brutal focus-within:outline focus-within:outline-3 focus-within:outline-primary focus-within:outline-offset-2"
    @click="navigateToApp"
    @keydown.enter="navigateToApp"
    @keydown.space.prevent="navigateToApp"
    tabindex="0"
    role="button"
    :aria-label="`查看應用: ${app.title}，分類: ${getCategoryLabel(app.category || 'other')}，作者: ${app.author_username}`"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-video overflow-hidden" :class="thumbnailBgClass" aria-hidden="true">
      <LazyImage
        v-if="app.thumbnail_s3_key"
        :src="getThumbnailUrl(app.thumbnail_s3_key)"
        :alt="`${app.title} 的預覽圖`"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-12 sm:w-16 h-12 sm:h-16 text-card-foreground opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>

      <!-- Category Badge - Brutalist Style -->
      <div
        v-if="app.category"
        class="absolute top-2 sm:top-3 right-2 sm:right-3"
      >
        <div
          class="px-2 sm:px-3 py-0.5 sm:py-1 bg-background border-2 border-foreground font-bold text-xs uppercase tracking-wide shadow-brutal-sm"
        >
          {{ getCategoryLabel(app.category) }}
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 space-y-3">
      <!-- Title -->
      <h3 class="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
        {{ app.title }}
      </h3>

      <!-- Description -->
      <p class="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
        {{ app.description || '暫無描述' }}
      </p>

      <!-- Tags -->
      <div v-if="app.tags?.length" class="flex flex-wrap gap-2">
        <span
          v-for="tag in app.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-1 text-xs font-mono border border-foreground bg-muted"
        >
          {{ tag }}
        </span>
        <span
          v-if="app.tags.length > 3"
          class="px-2 py-1 text-xs font-mono border border-dashed border-foreground bg-background"
        >
          +{{ app.tags.length - 3 }}
        </span>
      </div>

      <!-- Rating -->
      <div v-if="app.avg_rating && app.avg_rating > 0">
        <Rating
          :rating="app.avg_rating"
          :count="app.rating_count"
          size="sm"
          show-value
        />
      </div>

      <!-- Meta Row -->
      <div class="flex items-center justify-between pt-3 border-t-2 border-foreground">
        <!-- Author -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 border-2 border-foreground flex items-center justify-center font-bold text-xs uppercase" :class="getAuthorBgClass()">
            {{ getInitials(app.author_username) }}
          </div>
          <span class="text-sm font-medium">{{ app.author_username }}</span>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-3 text-xs font-mono">
          <span class="text-muted-foreground">{{ formatCount(app.view_count) }}</span>
          <span v-if="app.favorite_count" class="text-foreground">♥ {{ formatCount(app.favorite_count) }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import Rating from '@/components/common/Rating.vue'
import LazyImage from '@/components/common/LazyImage.vue'

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

// Solid color backgrounds for thumbnails based on category
const thumbnailBgClass = computed(() => {
  const category = props.app.category || 'other'
  const bgClasses: Record<string, string> = {
    game: 'bg-secondary',
    tool: 'bg-primary',
    art: 'bg-accent-purple',
    education: 'bg-accent',
    demo: 'bg-accent-cyan',
    experiment: 'bg-accent-orange',
    other: 'bg-muted'
  }
  return bgClasses[category] || bgClasses.other
})

// Author avatar background color
const getAuthorBgClass = () => {
  const colors = [
    'bg-primary text-primary-foreground',
    'bg-secondary text-secondary-foreground',
    'bg-accent text-accent-foreground',
    'bg-accent-purple text-white',
    'bg-accent-orange text-white'
  ]
  // Use first char of username to determine color
  const charCode = props.app.author_username.charCodeAt(0)
  return colors[charCode % colors.length]
}

// Get thumbnail URL
const getThumbnailUrl = (s3Key: string) => {
  return `${config.public.s3BaseUrl}/${s3Key}`
}

// Get initials from username
const getInitials = (username: string) => {
  return username.slice(0, 2).toUpperCase()
}

// Format count (1000 → 1K)
const formatCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

// Category labels (no emojis)
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    game: '遊戲',
    tool: '工具',
    art: '藝術',
    education: '教育',
    demo: '展示',
    experiment: '實驗',
    other: '其他'
  }
  return labels[category] || category
}

// Navigate to app detail
const navigateToApp = () => {
  navigateTo(`/app/${props.app.id}`)
}
</script>
