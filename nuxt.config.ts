// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nitro 設定
  // Nitro 設定
  nitro: {
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
    tebiBucket: process.env.TEBI_BUCKET || 'boyo-app-share',

    // Public (client-exposed)
    public: {
      apiBase: '/api',
      s3BaseUrl: process.env.NUXT_PUBLIC_S3_BASE_URL || 'https://s3.tebi.io/boyo-app-share',
      // SEO 設定
      appName: process.env.NUXT_PUBLIC_APP_NAME || '博幼APP分享平臺',
      appNameEn: process.env.NUXT_PUBLIC_APP_NAME_EN || 'Boyo App Share',
      appDescription: process.env.NUXT_PUBLIC_APP_DESCRIPTION || '博幼基金會教學應用分享平台 - 快速分享與瀏覽教育性 HTML 應用',
      appKeywords: process.env.NUXT_PUBLIC_APP_KEYWORDS || '博幼基金會,教育,HTML App,應用分享,教學工具,互動學習'
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
