<template>
  <div class="min-h-screen flex flex-col bg-background relative">
    <!-- Header with Brutalist design -->
    <header
      class="border-b-2 md:border-b-4 border-foreground bg-background/95 backdrop-blur-md sticky top-0 z-50 transition-shadow duration-200 shadow-brutal-sm"
      role="banner"
    >
      <nav class="container mx-auto px-4 py-3 md:py-4" aria-label="主要導航">
        <div class="flex items-center justify-between">
          <!-- Logo - Monospace, bold, uppercase -->
          <NuxtLink
            to="/"
            class="text-xl md:text-2xl font-mono font-bold uppercase tracking-tight hover:text-primary transition-colors z-50 relative focus-ring"
            @click="isMenuOpen = false"
            aria-label="返回首頁"
          >
            {{ config.public.appName }}
          </NuxtLink>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex gap-3 items-center" role="navigation">
            <!-- Nav Links -->
            <NuxtLink
              to="/explore"
              class="px-4 py-2 font-bold uppercase text-sm tracking-wide hover:bg-muted transition-colors focus-ring rounded-sm"
              aria-label="探索應用"
            >
              探索
            </NuxtLink>
            <NuxtLink
              to="/create"
              class="px-4 py-2 font-bold uppercase text-sm tracking-wide hover:bg-muted transition-colors focus-ring rounded-sm"
              aria-label="建立新應用"
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

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden text-sm font-bold uppercase tracking-wide border-2 border-foreground px-3 py-1.5 shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all z-50 relative bg-background focus-ring"
            @click="isMenuOpen = !isMenuOpen"
            :aria-expanded="isMenuOpen"
            :aria-label="isMenuOpen ? '關閉選單' : '開啟選單'"
            aria-controls="mobile-menu"
          >
            {{ isMenuOpen ? 'Close' : 'Menu' }}
          </button>
        </div>
      </nav>
    </header>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="isMenuOpen"
      id="mobile-menu"
      class="fixed inset-0 z-40 bg-background flex flex-col pt-24 px-6 md:hidden overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="行動版選單"
    >
      <div class="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>

      <nav class="flex flex-col gap-6 relative z-10" aria-label="行動版導航">
        <NuxtLink
          to="/explore"
          class="text-4xl font-bold uppercase tracking-tighter border-b-2 border-foreground pb-2 hover:text-primary transition-colors"
          @click="isMenuOpen = false"
        >
          探索應用
        </NuxtLink>
        <NuxtLink
          to="/create"
          class="text-4xl font-bold uppercase tracking-tighter border-b-2 border-foreground pb-2 hover:text-primary transition-colors"
          @click="isMenuOpen = false"
        >
          建立應用
        </NuxtLink>

        <div class="h-4"></div>

        <template v-if="!user">
          <NuxtLink
            to="/login"
            class="text-4xl font-bold uppercase tracking-tighter border-b-2 border-foreground pb-2 hover:text-primary transition-colors"
            @click="isMenuOpen = false"
          >
            登入
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="text-4xl font-bold uppercase tracking-tighter text-primary border-b-2 border-foreground pb-2 hover:text-foreground transition-colors"
            @click="isMenuOpen = false"
          >
            註冊帳號
          </NuxtLink>
        </template>

        <template v-else>
          <div class="flex items-center gap-4 py-2">
            <div class="w-12 h-12 border-3 border-foreground bg-primary flex items-center justify-center font-bold text-lg text-primary-foreground uppercase">
              {{ getUserInitials(user.username) }}
            </div>
            <span class="text-2xl font-bold">{{ user.username }}</span>
          </div>

          <button
            @click="() => { handleLogout(); isMenuOpen = false; }"
            class="text-left text-4xl font-bold uppercase tracking-tighter border-b-2 border-foreground pb-2 text-destructive hover:text-destructive/80 transition-colors"
          >
            登出
          </button>
        </template>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="flex-1" role="main" id="main-content">
      <slot />
    </main>

    <!-- Footer with Brutalist design -->
    <footer class="border-t-2 md:border-t-4 border-foreground bg-background py-8 md:py-12" role="contentinfo">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-center md:text-left">
          <!-- Copyright -->
          <div class="text-sm font-mono">
            &copy; 2025 <span class="font-bold">{{ config.public.appName }}</span> - MIT License
          </div>

          <!-- Links -->
          <div class="flex flex-wrap justify-center gap-6 text-sm font-bold uppercase tracking-wide">
            <NuxtLink to="/about" class="hover:text-primary transition-colors">關於</NuxtLink>
            <NuxtLink to="/terms" class="hover:text-primary transition-colors">使用條款</NuxtLink>
            <NuxtLink to="/privacy" class="hover:text-primary transition-colors">隱私政策</NuxtLink>
            <a href="https://github.com/killkli/boyo-app-share" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const config = useRuntimeConfig()
const { user, logout, initAuth } = useAuth()
const router = useRouter()

const isMenuOpen = ref(false)

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
