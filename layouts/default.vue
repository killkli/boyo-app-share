<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Header with Brutalist design -->
    <header class="border-b-4 border-foreground bg-background">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo - Monospace, bold, uppercase -->
          <NuxtLink
            to="/"
            class="text-2xl font-mono font-bold uppercase tracking-tight hover:text-primary transition-colors"
          >
            {{ config.public.appName }}
          </NuxtLink>

          <!-- Navigation -->
          <div class="flex gap-3 items-center">
            <!-- Nav Links -->
            <NuxtLink
              to="/explore"
              class="px-4 py-2 font-bold uppercase text-sm tracking-wide hover:bg-muted transition-colors"
            >
              探索
            </NuxtLink>
            <NuxtLink
              to="/create"
              class="px-4 py-2 font-bold uppercase text-sm tracking-wide hover:bg-muted transition-colors"
            >
              建立
            </NuxtLink>

            <!-- Unauthenticated State -->
            <template v-if="!user">
              <NuxtLink
                to="/login"
                class="px-4 py-2 font-bold uppercase text-sm tracking-wide hover:bg-muted transition-colors"
              >
                登入
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="px-4 py-2 bg-primary text-primary-foreground border-3 border-foreground font-bold uppercase text-sm tracking-wide shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-brutal-sm transition-all duration-150"
              >
                註冊
              </NuxtLink>
            </template>

            <!-- Authenticated State -->
            <template v-else>
              <div class="flex items-center gap-3">
                <!-- User Avatar - Square with border -->
                <div class="flex items-center gap-2 px-3 py-2 border-2 border-foreground bg-muted">
                  <div class="w-8 h-8 border-2 border-foreground bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground uppercase">
                    {{ getUserInitials(user.username) }}
                  </div>
                  <span class="font-bold text-sm">
                    {{ user.username }}
                  </span>
                </div>

                <!-- Logout Button -->
                <button
                  @click="handleLogout"
                  class="px-4 py-2 border-3 border-foreground bg-background hover:bg-muted font-bold uppercase text-sm tracking-wide shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-brutal-sm transition-all duration-150"
                >
                  登出
                </button>
              </div>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer with Brutalist design -->
    <footer class="border-t-4 border-foreground bg-background py-8">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Copyright -->
          <div class="text-sm font-mono">
            &copy; 2024 <span class="font-bold">{{ config.public.appName }}</span>
          </div>

          <!-- Links -->
          <div class="flex gap-6 text-sm font-bold uppercase tracking-wide">
            <a href="#" class="hover:text-primary transition-colors">關於</a>
            <a href="#" class="hover:text-primary transition-colors">條款</a>
            <a href="#" class="hover:text-primary transition-colors">隱私</a>
            <a href="https://github.com" target="_blank" class="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { user, logout, initAuth } = useAuth()
const router = useRouter()

// Initialize auth state
onMounted(() => {
  initAuth()
})

// Get user initials for avatar
const getUserInitials = (username: string): string => {
  return username.slice(0, 2).toUpperCase()
}

// Handle logout
const handleLogout = () => {
  logout()
  router.push('/')
}
</script>
