<template>
  <div
    class="group card-tilt cursor-pointer"
    :class="cardRotationClass"
    @click="navigateToApp"
  >
    <Card class="overflow-hidden shadow-playful border-2 bg-white h-full">
      <!-- Thumbnail with colorful gradient backgrounds -->
      <div class="relative aspect-video overflow-hidden" :class="thumbnailBgClass">
        <LazyImage
          v-if="app.thumbnail_s3_key"
          :src="getThumbnailUrl(app.thumbnail_s3_key)"
          :alt="app.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <div class="text-white/80 transform group-hover:scale-110 transition-transform duration-300">
            <svg class="w-20 h-20 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
        </div>

        <!-- Category badge with sticker style -->
        <div
          v-if="app.category"
          class="absolute top-3 right-3"
        >
          <Badge
            class="badge-sticker font-bold text-sm px-3 py-1.5 border-2 border-black/10"
            :class="getCategoryBgClass(app.category)"
          >
            {{ getCategoryEmoji(app.category) }} {{ getCategoryLabel(app.category) }}
          </Badge>
        </div>

        <!-- Decorative corner accent -->
        <div class="absolute bottom-0 left-0 w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-white"></div>
      </div>

      <!-- Content -->
      <CardHeader class="pb-3 space-y-2">
        <CardTitle class="text-xl font-bold line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors">
          {{ app.title }}
        </CardTitle>
        <CardDescription class="line-clamp-2 text-base">
          {{ app.description || '暫無描述' }}
        </CardDescription>
      </CardHeader>

      <CardContent class="pb-4 space-y-3">
        <!-- Tags with playful styling -->
        <div v-if="app.tags && app.tags.length > 0" class="flex flex-wrap gap-2">
          <Badge
            v-for="(tag, index) in app.tags.slice(0, 3)"
            :key="tag"
            variant="outline"
            class="text-xs font-medium border-2 transform transition-transform hover:scale-105"
            :class="getTagColorClass(index)"
          >
            {{ tag }}
          </Badge>
          <Badge
            v-if="app.tags.length > 3"
            variant="outline"
            class="text-xs font-medium border-2 border-dashed"
          >
            +{{ app.tags.length - 3 }}
          </Badge>
        </div>

        <!-- Rating -->
        <div v-if="app.avg_rating && app.avg_rating > 0" class="mb-3">
          <Rating
            :rating="app.avg_rating"
            :count="app.rating_count"
            size="sm"
            show-value
          />
        </div>

        <!-- Author info and stats -->
        <div class="flex items-center justify-between pt-2 border-t-2 border-dashed border-border">
          <div class="flex items-center gap-2">
            <Avatar class="w-7 h-7 border-2 border-white shadow-sm ring-2 ring-[hsl(var(--primary))]/20">
              <AvatarImage
                v-if="app.author_avatar"
                :src="app.author_avatar"
                :alt="app.author_username"
              />
              <AvatarFallback class="text-xs font-bold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white">
                {{ getInitials(app.author_username) }}
              </AvatarFallback>
            </Avatar>
            <span class="text-sm font-medium">{{ app.author_username }}</span>
          </div>

          <div class="flex items-center gap-3 text-sm font-medium">
            <!-- View count -->
            <div class="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{{ formatCount(app.view_count) }}</span>
            </div>

            <!-- Comment count -->
            <div v-if="app.comment_count" class="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{{ formatCount(app.comment_count) }}</span>
            </div>

            <!-- Favorite count -->
            <div v-if="app.favorite_count" class="flex items-center gap-1 text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]/80 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{{ formatCount(app.favorite_count) }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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

// Playful card rotation - each card gets a slight tilt
const cardRotationClass = computed(() => {
  const rotations = [
    'rotate-[-0.5deg]',
    'rotate-[0.5deg]',
    'rotate-[-1deg]',
    'rotate-[1deg]',
    'rotate-0'
  ]
  // Use app ID to consistently assign rotation
  const index = parseInt(props.app.id.slice(-1), 16) % rotations.length
  return rotations[index]
})

// Vibrant gradient backgrounds for thumbnails
const thumbnailBgClass = computed(() => {
  const gradients = [
    'bg-gradient-to-br from-[hsl(var(--color-sunshine))] to-[hsl(var(--color-coral))]',
    'bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--color-lavender))]',
    'bg-gradient-to-br from-[hsl(var(--color-mint))] to-[hsl(var(--primary))]',
    'bg-gradient-to-br from-[hsl(var(--color-coral))] to-[hsl(var(--color-peach))]',
    'bg-gradient-to-br from-[hsl(var(--color-lavender))] to-[hsl(var(--secondary))]'
  ]
  const index = parseInt(props.app.id.slice(-2), 16) % gradients.length
  return gradients[index]
})

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

// Category background colors with bold, vibrant palette
const getCategoryBgClass = (category: string) => {
  const bgClasses: Record<string, string> = {
    game: 'bg-[hsl(var(--secondary))] text-white',
    tool: 'bg-[hsl(var(--primary))] text-white',
    art: 'bg-[hsl(var(--color-lavender))] text-[hsl(var(--foreground))]',
    education: 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]',
    demo: 'bg-[hsl(var(--color-mint))] text-[hsl(var(--foreground))]',
    experiment: 'bg-[hsl(var(--color-peach))] text-[hsl(var(--foreground))]',
    other: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
  }
  return bgClasses[category] || bgClasses.other
}

// Category emojis for visual interest
const getCategoryEmoji = (category: string) => {
  const emojis: Record<string, string> = {
    game: '🎮',
    tool: '🔧',
    art: '🎨',
    education: '📚',
    demo: '✨',
    experiment: '🧪',
    other: '📦'
  }
  return emojis[category] || emojis.other
}

// Category labels
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

// Colorful tag classes
const getTagColorClass = (index: number) => {
  const colors = [
    'border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10',
    'border-[hsl(var(--secondary))]/40 text-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/10',
    'border-[hsl(var(--color-lavender))]/60 text-[hsl(var(--color-lavender))] hover:bg-[hsl(var(--color-lavender))]/10'
  ]
  return colors[index % colors.length]
}

// Navigate to app detail
const navigateToApp = () => {
  navigateTo(`/app/${props.app.id}`)
}
</script>
