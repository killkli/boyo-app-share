<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          AI App Share
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          單頁 HTML App 快速分享平台
        </p>
        <div class="flex gap-4 justify-center">
          <NuxtLink
            to="/explore"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            探索應用
          </NuxtLink>
          <NuxtLink
            to="/create"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            建立應用
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>
