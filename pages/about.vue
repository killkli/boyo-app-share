<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/" class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首頁
        </NuxtLink>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">關於博幼APP分享平臺</h1>
        <p class="text-xl text-gray-600">讓知識帶希望回家</p>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <!-- 理念與願景 -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">我們的理念</h2>
          </div>

          <div class="space-y-6">
            <div class="border-l-4 border-blue-600 pl-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-3">教育脫貧，讓知識帶希望回家</h3>
              <p class="text-gray-700 text-lg leading-relaxed mb-4">
                博幼基金會自 2002 年由李家同先生創辦以來，秉持著<strong class="text-blue-600">「不能讓窮孩子落入永遠貧困」</strong>的理念，
                深信「世襲貧窮的問題癥結，出在教育」。
              </p>
              <p class="text-gray-700 text-lg leading-relaxed">
                博幼APP分享平臺承襲這份使命，致力於打造一個開放、友善的教育資源共享空間，
                讓教育工作者、學生和所有熱愛學習的人們，能夠自由分享與取用優質的教學應用程式。
              </p>
            </div>

            <div class="bg-blue-50 rounded-lg p-6">
              <h4 class="text-xl font-bold text-gray-900 mb-3">核心願景</h4>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>提升學習成就：</strong>透過互動式的教學應用，讓學習變得更有趣、更有效</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>促進知識共享：</strong>降低技術門檻，讓每位教育者都能分享創意教學工具</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>縮短數位落差：</strong>提供免費、開放的教育資源，讓偏鄉孩子也能享有優質學習內容</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>賦予選擇能力：</strong>幫助孩子建立扎實的基礎能力，未來有選擇職業和生活模式的能力</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 平台特色 -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">平台特色</h2>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div class="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <h3 class="text-xl font-bold text-gray-900 mb-3">🚀 簡單易用</h3>
              <p class="text-gray-700">
                三種上傳方式（剪貼簿、檔案、壓縮檔），無需複雜設定，
                幾分鐘內就能分享你的教學應用。
              </p>
            </div>

            <div class="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <h3 class="text-xl font-bold text-gray-900 mb-3">🎯 教育導向</h3>
              <p class="text-gray-700">
                專注於教育性質的互動應用，包含遊戲、測驗、動畫、
                工具等多元類型，豐富教學內容。
              </p>
            </div>

            <div class="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <h3 class="text-xl font-bold text-gray-900 mb-3">🛡️ 安全可靠</h3>
              <p class="text-gray-700">
                採用 Sandbox 沙箱環境預覽，XSS 防護機制，
                確保每個應用都能安全地執行。
              </p>
            </div>

            <div class="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <h3 class="text-xl font-bold text-gray-900 mb-3">🤝 社群互動</h3>
              <p class="text-gray-700">
                評分、評論、收藏功能，讓使用者能夠分享使用心得，
                形成良性的知識交流社群。
              </p>
            </div>
          </div>
        </div>

        <!-- 適用對象 -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">適合誰使用？</h2>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">教育工作者</h3>
              <p class="text-gray-600 text-sm">
                老師、教授、講師，分享自製的互動教學工具，
                讓課堂更生動有趣。
              </p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">學生</h3>
              <p class="text-gray-600 text-sm">
                使用豐富的互動應用輔助學習，
                也能分享自己創作的學習工具。
              </p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">開發者</h3>
              <p class="text-gray-600 text-sm">
                前端開發者、設計師，將創意轉化為教育工具，
                回饋給社群。
              </p>
            </div>
          </div>
        </div>

        <!-- 開源理念 -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">開源精神</h2>
          </div>

          <div class="space-y-4">
            <p class="text-gray-700 text-lg leading-relaxed">
              本平台採用 <strong class="text-orange-600">MIT License</strong> 開源授權，
              意味著任何人都可以自由使用、修改和分發程式碼。我們相信，
              透過開源協作，能夠匯集更多智慧，創造出更好的教育工具。
            </p>

            <div class="bg-orange-50 rounded-lg p-6">
              <h4 class="text-lg font-bold text-gray-900 mb-3">如何參與？</h4>
              <ul class="space-y-2 text-gray-700">
                <li class="flex items-start gap-2">
                  <span class="text-orange-600 font-bold">•</span>
                  <span>在 <a href="https://github.com/killkli/boyo-app-share" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">GitHub</a> 上 Star 和 Fork 專案</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-600 font-bold">•</span>
                  <span>回報問題或建議新功能（提交 Issue）</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-600 font-bold">•</span>
                  <span>貢獻程式碼（提交 Pull Request）</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-600 font-bold">•</span>
                  <span>分享你的教學應用，讓更多人受益</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 技術架構 -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">技術架構</h2>
          </div>

          <p class="text-gray-700 mb-4">
            本平台採用現代化的技術棧，注重效能、安全性和開發體驗：
          </p>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-2xl">⚡</span>
              <div>
                <div class="font-bold text-gray-900">Nuxt.js 3</div>
                <div class="text-sm text-gray-600">現代化全端框架</div>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-2xl">🎨</span>
              <div>
                <div class="font-bold text-gray-900">TailwindCSS</div>
                <div class="text-sm text-gray-600">快速 UI 開發</div>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-2xl">🗄️</span>
              <div>
                <div class="font-bold text-gray-900">PostgreSQL</div>
                <div class="text-sm text-gray-600">可靠的資料庫</div>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-2xl">☁️</span>
              <div>
                <div class="font-bold text-gray-900">Tebi S3</div>
                <div class="text-sm text-gray-600">檔案儲存服務</div>
              </div>
            </div>
          </div>

          <div class="mt-6 text-center">
            <a
              href="https://github.com/killkli/boyo-app-share"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              查看 GitHub 專案
            </a>
          </div>
        </div>

        <!-- 聯絡資訊 -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-4">一起讓教育更美好</h2>
            <p class="text-lg mb-6 text-blue-50">
              如果您有任何問題、建議，或想要參與這個專案，歡迎與我們聯繫！
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/killkli/boyo-app-share/issues"
                target="_blank"
                rel="noopener noreferrer"
                class="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                提交建議
              </a>
              <NuxtLink
                to="/privacy"
                class="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
              >
                隱私政策
              </NuxtLink>
              <NuxtLink
                to="/terms"
                class="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
              >
                使用條款
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 設定頁面 meta
useHead({
  title: '關於我們 - 博幼APP分享平臺',
  meta: [
    {
      name: 'description',
      content: '博幼APP分享平臺承襲博幼基金會「教育脫貧，讓知識帶希望回家」的理念，打造開放的教育資源共享空間。'
    },
    {
      name: 'keywords',
      content: '博幼基金會, 教育, 開源, 教學應用, 知識分享, 偏鄉教育'
    }
  ]
})
</script>
