<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Global app setup
const config = useRuntimeConfig()

useHead({
  title: `${config.public.appName} - ${config.public.appNameEn}`,
  meta: [
    { name: 'description', content: config.public.appDescription },
    { name: 'keywords', content: config.public.appKeywords }
  ]
})
</script>
