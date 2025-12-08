<template>
  <div class="app-preview w-full h-full border rounded-lg overflow-hidden bg-white">
    <iframe
      :srcdoc="htmlContent"
      sandbox="allow-scripts allow-forms allow-modals"
      class="w-full h-full border-0"
      title="App Preview"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * AppPreview - App 即時預覽組件
 *
 * 使用 iframe sandbox 安全地預覽 HTML 內容
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
</script>

<style scoped>
.app-preview {
  min-height: 400px;
}
</style>
