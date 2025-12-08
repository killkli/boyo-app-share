// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Cloudflare Pages 部署設定
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      database: true
    }
  },

  // 運行時配置
  runtimeConfig: {
    // Private (server-only)
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    tebiEndpoint: process.env.TEBI_ENDPOINT || 'https://s3.tebi.io',
    tebiAccessKey: process.env.TEBI_ACCESS_KEY,
    tebiSecretKey: process.env.TEBI_SECRET_KEY,
    tebiBucket: process.env.TEBI_BUCKET || 'ai-app-share',

    // Public (client-exposed)
    public: {
      apiBase: '/api',
      s3BaseUrl: process.env.NUXT_PUBLIC_S3_BASE_URL || 'https://s3.tebi.io/ai-app-share'
    }
  },

  // 模組
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@vueuse/nuxt'
  ],

  // shadcn-nuxt 配置
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true
  },

  // 開發伺服器
  devServer: {
    port: 3000
  },

  // 相容性日期
  compatibilityDate: '2024-12-08'
})
