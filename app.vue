<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Global app setup
useHead({
  title: 'AI App Share - 單頁 HTML App 快速分享平台',
  meta: [
    { name: 'description', content: '快速上傳、分享、瀏覽單頁 HTML 應用' }
  ]
})
</script>
