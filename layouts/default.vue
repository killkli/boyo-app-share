<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            {{ config.public.appName }}
          </NuxtLink>
          <div class="flex gap-4 items-center">
            <NuxtLink to="/explore" class="text-gray-700 hover:text-gray-900">
              探索
            </NuxtLink>
            <NuxtLink to="/create" class="text-gray-700 hover:text-gray-900">
              建立
            </NuxtLink>

            <!-- 未登入狀態 -->
            <template v-if="!user">
              <NuxtLink to="/login" class="text-gray-700 hover:text-gray-900">
                登入
              </NuxtLink>
              <NuxtLink to="/register" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                註冊
              </NuxtLink>
            </template>

            <!-- 已登入狀態 -->
            <template v-else>
              <div class="flex items-center gap-3">
                <span class="text-gray-700">
                  {{ user.username }}
                </span>
                <button
                  @click="handleLogout"
                  class="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  登出
                </button>
              </div>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-gray-100 py-6">
      <div class="container mx-auto px-4 text-center text-gray-600">
        <p>&copy; 2024 {{ config.public.appName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { user, logout, initAuth } = useAuth()
const router = useRouter()

// 初始化認證狀態
onMounted(() => {
  initAuth()
})

const handleLogout = () => {
  logout()
  router.push('/')
}
</script>
