<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/" class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首頁
        </NuxtLink>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">使用條款</h1>
        <p class="text-gray-600">最後更新日期：2025年12月9日</p>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-lg shadow-lg p-8 space-y-8">
        <!-- 前言 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">前言</h2>
          <p class="text-gray-700 leading-relaxed">
            歡迎使用博幼APP分享平臺（以下簡稱「本平臺」）。在使用本平臺服務之前，
            請仔細閱讀以下使用條款。使用本平臺即表示您同意遵守本使用條款的所有規定。
            若您不同意本條款，請勿使用本平臺服務。
          </p>
        </section>

        <!-- 服務說明 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">一、服務說明</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">1.1 服務內容</h3>
              <p class="text-gray-700 leading-relaxed">
                本平臺提供一個教育性質的 HTML 應用程式分享平台，使用者可以：
              </p>
              <ul class="list-disc list-inside text-gray-700 mt-2 ml-4 space-y-1">
                <li>上傳、分享自己創作的 HTML 應用程式</li>
                <li>瀏覽、使用其他使用者分享的應用程式</li>
                <li>對應用程式進行評分、評論和收藏</li>
                <li>透過搜尋和分類功能尋找所需的教學資源</li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">1.2 服務性質</h3>
              <p class="text-gray-700 leading-relaxed">
                本平臺為<strong class="text-blue-600">免費、開源、教育性質</strong>的服務，
                旨在促進知識分享與教育資源的流通。我們不對服務的持續可用性或特定功能的提供做出保證。
              </p>
            </div>
          </div>
        </section>

        <!-- 使用者責任 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">二、使用者責任與義務</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">2.1 帳號責任</h3>
              <p class="text-gray-700 leading-relaxed mb-2">
                使用者需對自己的帳號安全負責，包括：
              </p>
              <ul class="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>妥善保管帳號密碼，不與他人分享</li>
                <li>若發現帳號遭未授權使用，應立即通知平臺</li>
                <li>對於帳號下的所有活動負責</li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">2.2 內容規範</h3>
              <p class="text-gray-700 leading-relaxed mb-2">
                使用者上傳的內容應符合以下規範：
              </p>
              <ul class="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>教育導向</strong>：內容應具有教育價值或學習用途</li>
                <li><strong>合法合規</strong>：不得違反中華民國法律或相關法規</li>
                <li><strong>尊重他人</strong>：不得包含仇恨、歧視、暴力或色情內容</li>
                <li><strong>安全無害</strong>：不得包含惡意程式碼或危害系統安全的內容</li>
                <li><strong>尊重智財</strong>：不得侵犯他人智慧財產權</li>
              </ul>
            </div>

            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <h4 class="text-red-800 font-bold mb-2">禁止行為</h4>
              <p class="text-red-700 text-sm mb-2">以下行為嚴格禁止，違者將立即停權並移除內容：</p>
              <ul class="list-disc list-inside text-red-700 text-sm ml-4 space-y-1">
                <li>上傳惡意軟體、病毒或任何危害系統的程式碼</li>
                <li>進行網路攻擊、入侵或其他非法行為</li>
                <li>濫用平臺功能，如大量灌水、洗分等</li>
                <li>冒充他人或提供虛假資訊</li>
                <li>從事商業廣告或垃圾訊息</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 智慧財產權 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">三、智慧財產權</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">3.1 使用者內容</h3>
              <p class="text-gray-700 leading-relaxed">
                使用者上傳到本平臺的內容，其智慧財產權仍歸使用者所有。
                但使用者授予本平臺<strong>非專屬、全球性、免費的授權</strong>，
                得以複製、儲存、傳輸、展示該內容，用於提供服務之目的。
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">3.2 平臺內容</h3>
              <p class="text-gray-700 leading-relaxed mb-2">
                本平臺的程式碼採用 <strong class="text-blue-600">MIT License</strong> 授權，任何人都可以自由使用、修改和分發。
                詳細授權條款請參閱 <a href="https://github.com/killkli/boyo-app-share/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">LICENSE 文件</a>。
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">3.3 侵權處理</h3>
              <p class="text-gray-700 leading-relaxed">
                若您認為平臺上的內容侵犯了您的智慧財產權，請透過 GitHub Issues 通知我們，
                我們將在合理時間內調查並採取適當措施。
              </p>
            </div>
          </div>
        </section>

        <!-- 免責聲明 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">四、免責聲明</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">4.1 內容責任</h3>
              <p class="text-gray-700 leading-relaxed">
                本平臺為使用者提供分享平台，<strong>不對使用者上傳的內容負責</strong>。
                使用者應自行判斷內容的正確性、適用性和安全性。
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">4.2 服務保證</h3>
              <p class="text-gray-700 leading-relaxed mb-2">
                本平臺服務以「現狀」提供，我們不保證：
              </p>
              <ul class="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>服務不會中斷或完全沒有錯誤</li>
                <li>服務能滿足您的特定需求</li>
                <li>透過服務取得的資訊完全正確</li>
                <li>第三方上傳內容的品質或安全性</li>
              </ul>
            </div>

            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <h4 class="text-yellow-800 font-bold mb-2">⚠️ 重要提醒</h4>
              <p class="text-yellow-700 text-sm">
                雖然我們採用 Sandbox 沙箱環境和多重安全機制，但仍建議使用者：
                <strong>不要在應用程式中輸入真實的個人資料、密碼或敏感資訊</strong>。
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">4.3 損害賠償</h3>
              <p class="text-gray-700 leading-relaxed">
                在法律允許的最大範圍內，本平臺及其營運者對於因使用或無法使用本服務
                而導致的任何直接、間接、附帶、特殊或衍生性損害，<strong>不負賠償責任</strong>。
              </p>
            </div>
          </div>
        </section>

        <!-- 服務變更與終止 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">五、服務變更與終止</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">5.1 服務修改</h3>
              <p class="text-gray-700 leading-relaxed">
                本平臺保留隨時修改、暫停或終止全部或部分服務的權利，無需事前通知。
                我們會盡可能在重大變更時提前通知使用者。
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">5.2 帳號終止</h3>
              <p class="text-gray-700 leading-relaxed">
                本平臺保留在使用者違反本使用條款時，暫停或終止其帳號的權利。
                使用者也可隨時自行停止使用本服務。
              </p>
            </div>
          </div>
        </section>

        <!-- 條款修改 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">六、條款修改</h2>
          <p class="text-gray-700 leading-relaxed">
            本平臺保留隨時修改本使用條款的權利。修改後的條款將在本頁面公布，
            並註明修改日期。繼續使用本服務即表示您接受修改後的條款。
            建議您定期檢視本頁面以了解最新的使用條款。
          </p>
        </section>

        <!-- 適用法律 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">七、適用法律與管轄權</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            本使用條款受<strong class="text-blue-600">中華民國法律</strong>管轄並依其解釋。
            因本條款所生之爭議，雙方同意以<strong>台灣台北地方法院</strong>為第一審管轄法院。
          </p>
        </section>

        <!-- 教育使命 -->
        <section class="bg-blue-50 rounded-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">我們的承諾</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            博幼APP分享平臺秉持博幼基金會「<strong class="text-blue-600">教育脫貧，讓知識帶希望回家</strong>」的理念，
            致力於提供一個安全、開放、友善的教育資源分享空間。
          </p>
          <p class="text-gray-700 leading-relaxed">
            我們相信透過知識共享，能夠幫助更多孩子獲得優質的學習資源，
            提升學習成就，未來擁有選擇職業和生活模式的能力。
          </p>
        </section>

        <!-- 聯絡方式 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">八、聯絡我們</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            如果您對本使用條款有任何疑問或建議，歡迎透過以下方式與我們聯繫：
          </p>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-700 mb-2">
              <strong>專案名稱：</strong>博幼APP分享平臺 (Boyo App Share)
            </p>
            <p class="text-gray-700 mb-2">
              <strong>GitHub：</strong>
              <a href="https://github.com/killkli/boyo-app-share" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                https://github.com/killkli/boyo-app-share
              </a>
            </p>
            <p class="text-gray-700 mb-2">
              <strong>Issues：</strong>
              <a href="https://github.com/killkli/boyo-app-share/issues" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                提交問題或建議
              </a>
            </p>
            <p class="text-gray-700">
              <strong>授權：</strong>MIT License
            </p>
          </div>
        </section>

        <!-- Footer -->
        <div class="text-center pt-6 border-t">
          <p class="text-sm text-gray-500 mb-3">
            使用本平臺即表示您同意本使用條款
          </p>
          <div class="flex flex-wrap justify-center gap-4 text-sm">
            <NuxtLink to="/" class="text-blue-600 hover:underline">
              返回首頁
            </NuxtLink>
            <NuxtLink to="/about" class="text-blue-600 hover:underline">
              關於我們
            </NuxtLink>
            <NuxtLink to="/privacy" class="text-blue-600 hover:underline">
              隱私政策
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 設定頁面 meta
useHead({
  title: '使用條款 - 博幼APP分享平臺',
  meta: [
    {
      name: 'description',
      content: '博幼APP分享平臺使用條款 - 了解您在使用本平臺時的權利與義務，以及我們的服務規範。'
    }
  ]
})
</script>
