<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt: string
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4='
})

const imgRef = ref<HTMLImageElement | null>(null)
const currentSrc = ref(props.placeholder)
const isLoaded = ref(false)
const hasError = ref(false)
let observer: IntersectionObserver | null = null

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  hasError.value = true
}

onMounted(() => {
  if (!imgRef.value) return

  // 建立 Intersection Observer
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 圖片進入視窗，載入真實圖片
        currentSrc.value = props.src
        // 停止觀察
        if (observer && imgRef.value) {
          observer.unobserve(imgRef.value)
        }
      }
    })
  })

  // 開始觀察圖片元素
  observer.observe(imgRef.value)
})

onUnmounted(() => {
  // 清理 observer
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <img
    ref="imgRef"
    :src="currentSrc"
    :alt="alt"
    :class="[props.class, { loaded: isLoaded, error: hasError }]"
    @load="handleLoad"
    @error="handleError"
  />
</template>

<style scoped>
img {
  transition: opacity 0.3s ease-in-out;
  opacity: 0.5;
}

img.loaded {
  opacity: 1;
}

img.error {
  opacity: 0.3;
}
</style>
