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

    // Auth.js
    authSecret: process.env.AUTH_SECRET,
    authOrigin: process.env.AUTH_ORIGIN || 'http://localhost:3000',

    // OAuth Providers
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,

    // S3
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
    '@vueuse/nuxt',
    '@sidebase/nuxt-auth',
    '@nuxtjs/seo'
  ],

  // Site Config (for @nuxtjs/seo)
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://boyo-app-share.zeabur.app',
    name: '博幼APP分享平臺',
    description: '博幼基金會教學應用分享平台 - 快速分享與瀏覽教育性 HTML 應用',
    defaultLocale: 'zh-TW'
  },

  // Sitemap 設定
  sitemap: {
    sources: [
      '/api/__sitemap__/urls'
    ],
    cacheMaxAgeSeconds: 3600 // 快取 1 小時
  },

  // Robots 設定
  robots: {
    sitemap: '/sitemap.xml',
    disallow: ['/api/', '/profile/', '/edit/', '/create']
  },

  // Auth.js 配置
  auth: {
    // baseURL 只設定路徑部分，origin 由 originEnvKey 環境變數提供
    // 開發環境：自動偵測 http://localhost:3000
    // 生產環境：從 AUTH_ORIGIN 環境變數讀取（如 https://domain.app）
    baseURL: '/api/auth',
    originEnvKey: 'AUTH_ORIGIN',
    provider: {
      type: 'authjs'
    },
    // Session 配置
    session: {
      enableRefreshPeriodically: false,
      enableRefreshOnWindowFocus: false
    },
    // 全域中間件設定（手動控制需要認證的頁面）
    globalAppMiddleware: {
      isEnabled: false
    }
  },

  // shadcn-nuxt 配置
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },

  // App 配置
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-TW'
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '博幼APP分享平臺',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'robots', content: 'index, follow' },
        { name: 'description', content: '博幼基金會教學應用分享平台 - 快速分享與瀏覽教育性 HTML 應用' },
        { name: 'keywords', content: '博幼基金會,教育,HTML App,應用分享,教學工具,互動學習' },
        // Open Graph 預設值
        { property: 'og:site_name', content: '博幼APP分享平臺' },
        { property: 'og:locale', content: 'zh_TW' },
        { property: 'og:type', content: 'website' },
      ]
    }
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
