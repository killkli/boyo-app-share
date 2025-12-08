<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            AI App Share
          </NuxtLink>
          <div class="flex gap-4">
            <NuxtLink to="/explore" class="text-gray-700 hover:text-gray-900">
              探索
            </NuxtLink>
            <NuxtLink to="/create" class="text-gray-700 hover:text-gray-900">
              建立
            </NuxtLink>
            <NuxtLink to="/login" class="text-gray-700 hover:text-gray-900">
              登入
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-gray-100 py-6">
      <div class="container mx-auto px-4 text-center text-gray-600">
        <p>&copy; 2024 AI App Share. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
