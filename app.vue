<template>
  <div>
    <NuxtLayout>
      <!-- Page Transitions with Nuxt -->
      <NuxtPage :transition="{
        name: 'page',
        mode: 'out-in',
        duration: 200
      }" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Global app setup
const config = useRuntimeConfig()

useHead({
  htmlAttrs: {
    lang: 'zh-TW'
  },
  title: `${config.public.appName} - ${config.public.appNameEn}`,
  meta: [
    { name: 'description', content: config.public.appDescription },
    { name: 'keywords', content: config.public.appKeywords },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#FFFFFF' },
    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: `${config.public.appName} - ${config.public.appNameEn}` },
    { property: 'og:description', content: config.public.appDescription },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${config.public.appName} - ${config.public.appNameEn}` },
    { name: 'twitter:description', content: config.public.appDescription }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<style>
/* Page Transition Animations - Minimal & Brutalist */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Screen Reader Only Utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
