<template>
  <div class="flex items-center gap-1">
    <!-- 星星評分 -->
    <div class="flex items-center gap-0.5">
      <button
        v-for="star in 5"
        :key="star"
        type="button"
        :disabled="!interactive"
        :class="[
          'transition-colors',
          interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
          getSizeClass()
        ]"
        @click="handleRate(star)"
        @mouseenter="handleHover(star)"
        @mouseleave="handleHoverEnd"
      >
        <svg
          :class="[
            'transition-all',
            getStarColor(star)
          ]"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            v-if="shouldShowFullStar(star)"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
          <path
            v-else-if="shouldShowHalfStar(star)"
            d="M12 2v15.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
          <path
            v-else
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
      </button>
    </div>

    <!-- 評分數值與數量 -->
    <div v-if="showValue || showCount" class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
      <span v-if="showValue" class="font-medium">{{ displayRating }}</span>
      <span v-if="showCount && count !== undefined" class="text-xs">({{ formatCount(count) }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  rating?: number
  count?: number
  interactive?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rating: 0,
  count: 0,
  interactive: false,
  size: 'md',
  showValue: false,
  showCount: true
})

const emit = defineEmits<{
  rate: [rating: number]
}>()

const hoverRating = ref<number | null>(null)

// 當前顯示的評分（懸停時顯示懸停值，否則顯示實際值）
const displayRatingValue = computed(() => {
  if (props.interactive && hoverRating.value !== null) {
    return hoverRating.value
  }
  return props.rating
})

// 顯示的評分數值
const displayRating = computed(() => {
  return displayRatingValue.value.toFixed(1)
})

// 判斷是否應該顯示完整星星
const shouldShowFullStar = (star: number) => {
  return displayRatingValue.value >= star
}

// 判斷是否應該顯示半星
const shouldShowHalfStar = (star: number) => {
  const value = displayRatingValue.value
  return value >= star - 0.5 && value < star
}

// 取得星星顏色
const getStarColor = (star: number) => {
  if (displayRatingValue.value >= star) {
    return 'text-yellow-400'
  }
  if (shouldShowHalfStar(star)) {
    return 'text-yellow-400'
  }
  return 'text-gray-300 dark:text-gray-600'
}

// 取得大小 class
const getSizeClass = () => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  return sizes[props.size]
}

// 處理評分
const handleRate = (rating: number) => {
  if (!props.interactive) return
  emit('rate', rating)
}

// 處理懸停
const handleHover = (rating: number) => {
  if (!props.interactive) return
  hoverRating.value = rating
}

// 處理懸停結束
const handleHoverEnd = () => {
  if (!props.interactive) return
  hoverRating.value = null
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
