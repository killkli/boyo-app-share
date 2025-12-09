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
        <h1 class="text-4xl font-bold text-gray-900 mb-2">隱私權政策</h1>
        <p class="text-gray-600">最後更新日期：2025年12月9日</p>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-lg shadow-lg p-8 space-y-8">
        <!-- 前言 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">前言</h2>
          <p class="text-gray-700 leading-relaxed">
            博幼APP分享平臺（以下簡稱「本平臺」）重視您的隱私權。本隱私權政策說明本平臺如何處理您使用本服務時的相關資訊，
            並遵守中華民國《個人資料保護法》及其相關法規之規定。
          </p>
        </section>

        <!-- 資料蒐集政策 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">一、資料蒐集政策</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">1.1 不蒐集個人資料</h3>
              <p class="text-gray-700 leading-relaxed">
                本平臺承諾<strong class="text-blue-600">不主動蒐集、處理或利用任何可識別個人身分的資料</strong>，包括但不限於：
              </p>
              <ul class="list-disc list-inside text-gray-700 mt-2 ml-4 space-y-1">
                <li>姓名、身分證字號或其他政府核發之身分證明文件號碼</li>
                <li>聯絡方式（電話、電子郵件、地址等）</li>
                <li>財務資訊（信用卡號、銀行帳號等）</li>
                <li>個人特徵資料（相片、指紋、聲音等）</li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">1.2 技術性資訊</h3>
              <p class="text-gray-700 leading-relaxed">
                為提供更好的服務體驗，本平臺可能會自動蒐集以下<strong>非個人識別的技術性資訊</strong>：
              </p>
              <ul class="list-disc list-inside text-gray-700 mt-2 ml-4 space-y-1">
                <li>瀏覽器類型和版本</li>
                <li>作業系統資訊</li>
                <li>訪問時間和頁面瀏覽記錄</li>
                <li>IP 位址（僅用於統計分析，不用於識別個人）</li>
              </ul>
              <p class="text-gray-600 text-sm mt-2">
                這些資訊僅用於改善服務品質、分析使用趨勢，且無法用於識別特定個人。
              </p>
            </div>
          </div>
        </section>

        <!-- Cookies 使用 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">二、Cookies 與追蹤技術</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            本平臺可能使用 Cookies 或類似技術來提升使用者體驗。Cookies 是儲存在您裝置上的小型文字檔案，
            用於記住您的偏好設定和瀏覽習慣。
          </p>
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p class="text-gray-700">
              <strong>您可以隨時透過瀏覽器設定拒絕或刪除 Cookies。</strong>
              請注意，停用 Cookies 可能影響部分網站功能的正常運作。
            </p>
          </div>
        </section>

        <!-- 資料安全 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">三、資料安全與保護</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            雖然本平臺不蒐集個人資料，但我們仍採取適當的技術和組織措施來保護平臺安全：
          </p>
          <ul class="list-disc list-inside text-gray-700 ml-4 space-y-2">
            <li>使用業界標準的加密技術保護資料傳輸（HTTPS）</li>
            <li>定期進行安全性檢查和系統更新</li>
            <li>限制系統存取權限，僅授權人員可接觸系統資料</li>
            <li>遵守相關資訊安全最佳實務</li>
          </ul>
        </section>

        <!-- 第三方連結 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">四、第三方連結與服務</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            本平臺可能包含連結至第三方網站或服務。這些外部連結不在本隱私權政策的適用範圍內。
            我們建議您在訪問第三方網站時，詳細閱讀其隱私權政策。
          </p>
          <p class="text-gray-600 text-sm">
            本平臺對於第三方網站的隱私保護措施或內容不負任何責任。
          </p>
        </section>

        <!-- 使用者上傳內容 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">五、使用者上傳內容</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            本平臺允許使用者上傳 HTML 應用程式。請注意：
          </p>
          <ul class="list-disc list-inside text-gray-700 ml-4 space-y-2">
            <li>請勿在上傳的內容中包含個人資料或敏感資訊</li>
            <li>您對上傳內容的隱私保護負有責任</li>
            <li>上傳的應用程式應遵守相關法律規定</li>
            <li>本平臺保留移除違反規定內容的權利</li>
          </ul>
        </section>

        <!-- 兒童隱私 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">六、兒童隱私保護</h2>
          <p class="text-gray-700 leading-relaxed">
            本平臺為教育性質平臺，可能有未成年人使用。由於本平臺不蒐集個人資料，
            因此不會特別針對兒童進行資料蒐集。若您是未成年人的家長或監護人，
            發現任何疑慮，歡迎透過下方聯絡方式與我們聯繫。
          </p>
        </section>

        <!-- 政策變更 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">七、隱私權政策之變更</h2>
          <p class="text-gray-700 leading-relaxed">
            本平臺保留隨時修改本隱私權政策的權利。當我們對政策進行重大變更時，
            會在網站上發布通知。建議您定期檢視本頁面以了解最新的隱私權政策。
          </p>
        </section>

        <!-- 您的權利 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">八、依個人資料保護法之權利</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            依據中華民國《個人資料保護法》第3條，您對於個人資料享有以下權利：
          </p>
          <ul class="list-disc list-inside text-gray-700 ml-4 space-y-2">
            <li>查詢或請求閱覽</li>
            <li>請求製給複製本</li>
            <li>請求補充或更正</li>
            <li>請求停止蒐集、處理或利用</li>
            <li>請求刪除</li>
          </ul>
          <p class="text-gray-600 text-sm mt-3">
            由於本平臺不蒐集個人資料，上述權利可能不適用。若您有任何疑問，請與我們聯繫。
          </p>
        </section>

        <!-- 聯絡方式 -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">九、聯絡我們</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            如果您對本隱私權政策有任何疑問或建議，歡迎透過以下方式與我們聯繫：
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
            <p class="text-gray-700">
              <strong>適用法律：</strong>中華民國法律
            </p>
          </div>
        </section>

        <!-- 法律聲明 -->
        <section class="border-t pt-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">法律聲明</h2>
          <p class="text-gray-700 leading-relaxed">
            本隱私權政策受中華民國法律管轄。任何因本政策所生之爭議，
            應以台灣台北地方法院為第一審管轄法院。
          </p>
        </section>

        <!-- Footer -->
        <div class="text-center pt-6 border-t">
          <p class="text-sm text-gray-500">
            本平臺為開源教育專案，遵守 MIT License
          </p>
          <NuxtLink to="/" class="text-blue-600 hover:underline text-sm mt-2 inline-block">
            返回首頁
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 設定頁面 meta
useHead({
  title: '隱私權政策 - 博幼APP分享平臺',
  meta: [
    {
      name: 'description',
      content: '博幼APP分享平臺隱私權政策 - 我們重視您的隱私，本平臺不蒐集個人資料，遵守中華民國個人資料保護法。'
    }
  ]
})
</script>
