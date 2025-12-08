<template>
  <div class="app-preview w-full h-full border rounded-lg overflow-hidden bg-white">
    <iframe
      v-if="iframeSrc"
      :src="iframeSrc"
      sandbox="allow-scripts allow-forms allow-modals"
      class="w-full h-full border-0"
      title="App Preview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

/**
 * AppPreview - App 即時預覽組件
 *
 * 使用 iframe + Blob URL 安全地預覽 HTML 內容
 * 使用 Blob URL 而非 srcdoc 可以避免跳脫字元問題
 *
 * Security:
 * - allow-scripts: 允許執行 JavaScript
 * - allow-forms: 允許表單提交
 * - allow-modals: 允許彈窗 (alert, confirm, etc.)
 * - 不允許: allow-same-origin, allow-top-navigation (防止惡意代碼)
 */

const props = defineProps<{
  htmlContent: string
}>()

const iframeSrc = ref<string>('')
let currentBlobUrl: string | null = null

// 清理舊的 Blob URL 避免內存洩漏
const cleanupBlobUrl = () => {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
}

// 創建新的 Blob URL
const createBlobUrl = (html: string) => {
  cleanupBlobUrl()

  const blob = new Blob([html], { type: 'text/html; charset=utf-8' })
  currentBlobUrl = URL.createObjectURL(blob)
  iframeSrc.value = currentBlobUrl
}

// 監聽 HTML 內容變化並更新預覽
watch(() => props.htmlContent, (newContent) => {
  if (newContent) {
    createBlobUrl(newContent)
  } else {
    cleanupBlobUrl()
    iframeSrc.value = ''
  }
}, { immediate: true })

// 組件卸載時清理 Blob URL
onUnmounted(() => {
  cleanupBlobUrl()
})
</script>

<style scoped>
.app-preview {
  min-height: 400px;
}
</style>
