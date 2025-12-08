<template>
  <Button
    :variant="variant"
    :size="size"
    :disabled="loading"
    @click="handleClick"
    :class="[
      'transition-all',
      isFavorited && 'text-red-500 hover:text-red-600'
    ]"
  >
    <svg
      :class="[
        'transition-all',
        iconSizeClass,
        loading && 'animate-pulse'
      ]"
      :fill="isFavorited ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
    <span v-if="showCount && favoriteCount > 0" class="ml-1">
      {{ formatCount(favoriteCount) }}
    </span>
    <span v-if="showLabel" class="ml-1">
      {{ isFavorited ? '已收藏' : '收藏' }}
    </span>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

interface Props {
  isFavorited?: boolean
  favoriteCount?: number
  isAuthenticated?: boolean
  loading?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showCount?: boolean
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorited: false,
  favoriteCount: 0,
  isAuthenticated: false,
  loading: false,
  variant: 'outline',
  size: 'default',
  showCount: true,
  showLabel: false
})

const emit = defineEmits<{
  toggle: []
}>()

// 圖示大小
const iconSizeClass = computed(() => {
  const sizes = {
    default: 'w-5 h-5',
    sm: 'w-4 h-4',
    lg: 'w-6 h-6',
    icon: 'w-5 h-5'
  }
  return sizes[props.size]
})

// 處理點擊
const handleClick = () => {
  if (props.loading) return

  // 未登入時導向登入頁
  if (!props.isAuthenticated) {
    navigateTo('/login')
    return
  }

  emit('toggle')
}

// 格式化數字
const formatCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
</script>
