<template>
  <div class="min-h-screen bg-paper">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Header with playful styling -->
      <div class="mb-10">
        <h1 class="text-5xl md:text-6xl font-bold mb-3">
          ✨ 建立新應用
        </h1>
        <div
          class="h-2 w-32 bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full">
        </div>
        <p class="mt-4 text-lg text-muted-foreground font-medium">
          分享你的創意，讓更多人看見！
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left: Form -->
        <div class="space-y-6">
          <Card class="border-2 shadow-playful rounded-3xl overflow-hidden">
            <CardHeader
              class="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--secondary))]/5 border-b-2 border-dashed">
              <CardTitle class="text-2xl">📝 App 資訊</CardTitle>
              <CardDescription class="text-base">填寫你的 HTML App 基本資訊</CardDescription>
            </CardHeader>
            <CardContent class="space-y-5 pt-6">
              <!-- Title -->
              <div class="space-y-2">
                <Label for="title" class="text-sm font-bold">📌 標題 *</Label>
                <Input id="title" v-model="form.title" placeholder="我的超酷 HTML App" class="border-2 rounded-xl text-base"
                  :class="{ 'border-red-500 focus:border-red-500': errors.title }" />
                <p v-if="errors.title" class="text-sm text-red-500 font-medium">{{ errors.title }}</p>
              </div>

              <!-- Description -->
              <div class="space-y-2">
                <Label for="description" class="text-sm font-bold">💬 描述</Label>
                <Textarea id="description" v-model="form.description" placeholder="這是一個簡單又有趣的 HTML App..." rows="3"
                  class="border-2 rounded-xl resize-none text-base" />
              </div>

              <!-- Category -->
              <div class="space-y-2">
                <Label for="category" class="text-sm font-bold">🏷️ 分類</Label>
                <Select v-model="form.category">
                  <SelectTrigger class="border-2 rounded-xl">
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tool">🔧 工具</SelectItem>
                    <SelectItem value="game">🎮 遊戲</SelectItem>
                    <SelectItem value="demo">✨ 展示</SelectItem>
                    <SelectItem value="experiment">🧪 實驗</SelectItem>
                    <SelectItem value="education">📚 教育</SelectItem>
                    <SelectItem value="art">🎨 藝術</SelectItem>
                    <SelectItem value="other">📦 其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Tags -->
              <div class="space-y-2">
                <Label for="tags" class="text-sm font-bold">🏷 標籤 (逗號分隔，最多 10 個)</Label>
                <Input id="tags" v-model="tagsInput" placeholder="javascript, html, css"
                  class="border-2 rounded-xl text-base" />
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-muted-foreground">
                    目前標籤: <span class="text-[hsl(var(--primary))] font-bold">{{ form.tags.length }}</span> / 10
                  </p>
                  <p v-if="errors.tags" class="text-sm text-red-500 font-medium">{{ errors.tags }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Upload Method -->
          <Card class="border-2 shadow-playful rounded-3xl overflow-hidden">
            <CardHeader
              class="bg-gradient-to-r from-[hsl(var(--accent))]/5 to-[hsl(var(--primary))]/5 border-b-2 border-dashed">
              <CardTitle class="text-2xl">📤 上傳方式</CardTitle>
              <CardDescription class="text-base">選擇如何上傳你的 HTML App</CardDescription>
            </CardHeader>
            <CardContent class="pt-6">
              <Tabs v-model="uploadType" class="w-full">
                <TabsList class="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-2xl border-2">
                  <TabsTrigger value="paste"
                    class="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-playful">
                    📋 剪貼簿
                  </TabsTrigger>
                  <TabsTrigger value="file"
                    class="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-playful">
                    📁 上傳檔案
                  </TabsTrigger>
                </TabsList>

                <!-- Paste upload -->
                <TabsContent value="paste" class="space-y-4 mt-6">
                  <div class="space-y-2">
                    <Label for="htmlContent" class="text-sm font-bold">💻 HTML 內容 *</Label>
                    <Textarea id="htmlContent" v-model="form.htmlContent"
                      placeholder="<html>&#10;  <body>&#10;    <h1>Hello World!</h1>&#10;  </body>&#10;</html>"
                      rows="12" class="font-mono text-sm border-2 rounded-xl resize-none"
                      :class="{ 'border-red-500 focus:border-red-500': errors.htmlContent }" />
                    <p v-if="errors.htmlContent" class="text-sm text-red-500 font-medium">{{ errors.htmlContent }}</p>
                  </div>
                </TabsContent>

                <!-- File upload -->
                <TabsContent value="file" class="space-y-4 mt-6">
                  <div class="space-y-2">
                    <Label for="fileInput" class="text-sm font-bold">📄 選擇 HTML 檔案 *</Label>
                    <Input id="fileInput" type="file" accept=".html,.htm"
                      class="border-2 rounded-xl cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-[hsl(var(--primary))]/10 file:text-[hsl(var(--primary))] hover:file:bg-[hsl(var(--primary))]/20"
                      @change="handleFileChange" :class="{ 'border-red-500': errors.file }" />
                    <p v-if="selectedFile" class="text-sm font-medium text-[hsl(var(--primary))]">
                      ✓ 已選擇: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                    </p>
                    <p v-if="errors.file" class="text-sm text-red-500 font-medium">{{ errors.file }}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <!-- Action buttons -->
          <div class="flex gap-4">
            <Button @click="handleSubmit" :disabled="isUploading"
              class="flex-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:from-[hsl(var(--primary))]/90 hover:to-[hsl(var(--secondary))]/90 text-white font-bold text-lg py-6 rounded-2xl shadow-playful hover:shadow-playful-lg transform hover:scale-[1.02] transition-all duration-300">
              <span v-if="isUploading" class="flex items-center gap-2">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                上傳中...
              </span>
              <span v-else class="flex items-center gap-2">
                🚀 上傳 App
              </span>
            </Button>
            <Button variant="outline" @click="handleReset" :disabled="isUploading"
              class="border-2 font-bold text-base px-8 py-6 rounded-2xl hover:bg-muted/50">
              🔄 重置
            </Button>
          </div>

          <!-- Error message -->
          <div v-if="uploadError" class="p-5 bg-red-50 border-2 border-red-200 rounded-2xl shadow-playful">
            <div class="flex items-start gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <p class="font-bold text-red-700 mb-1">上傳失敗</p>
                <p class="text-sm text-red-600">{{ uploadError }}</p>
              </div>
            </div>
          </div>

          <!-- Success message -->
          <div v-if="uploadSuccess" class="p-5 bg-green-50 border-2 border-green-200 rounded-2xl shadow-playful">
            <div class="flex items-start gap-3">
              <span class="text-2xl">🎉</span>
              <div class="flex-1">
                <p class="font-bold text-green-700 mb-2">上傳成功！</p>
                <a :href="uploadedUrl" target="_blank"
                  class="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 hover:underline">
                  查看你的 App →
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Live Preview -->
        <div class="space-y-4">
          <Card class="sticky top-4 border-2 shadow-playful-lg rounded-3xl overflow-hidden">
            <CardHeader
              class="bg-gradient-to-r from-[hsl(var(--color-lavender))]/10 to-[hsl(var(--color-mint))]/10 border-b-2 border-dashed">
              <CardTitle class="text-2xl">👀 即時預覽</CardTitle>
              <CardDescription class="text-base">查看你的 HTML App 渲染效果</CardDescription>
            </CardHeader>
            <CardContent class="p-6">
              <AppPreview v-if="form.htmlContent" :html-content="form.htmlContent" />
              <div v-else
                class="w-full h-[400px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                <div class="text-6xl mb-4">📱</div>
                <p class="font-medium text-lg">等待 HTML 內容...</p>
                <p class="text-sm mt-2">貼上或上傳你的程式碼即可預覽</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui/tabs'
import AppPreview from '~/components/app/AppPreview.vue'

// 定義頁面 meta
definePageMeta({
  middleware: 'auth' // 需要登入才能訪問
})

const { token } = useAuth()
const router = useRouter()

// 上傳方式
const uploadType = ref<'paste' | 'file'>('paste')

// 表單資料
const form = ref({
  title: '',
  description: '',
  category: '',
  tags: [] as string[],
  htmlContent: ''
})

// 標籤輸入
const tagsInput = ref('')

// 監聽標籤輸入變化
watch(tagsInput, (newValue) => {
  if (newValue) {
    form.value.tags = newValue
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10) // 最多 10 個標籤
  } else {
    form.value.tags = []
  }
})

// 檔案上傳
const selectedFile = ref<File | null>(null)

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    selectedFile.value = file

    // 讀取檔案內容
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.htmlContent = e.target?.result as string
    }
    reader.readAsText(file)

    // 清除檔案錯誤
    errors.value.file = ''
  }
}

// 格式化檔案大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// 錯誤狀態
const errors = ref<Record<string, string>>({})

// 上傳狀態
const isUploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const uploadedUrl = ref('')

// 驗證表單
const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = '標題不能為空'
  }

  if (form.value.title.length > 255) {
    errors.value.title = '標題最多 255 個字元'
  }

  if (form.value.description && form.value.description.length > 2000) {
    errors.value.description = '描述最多 2000 個字元'
  }

  if (form.value.tags.length > 10) {
    errors.value.tags = '標籤最多 10 個'
  }

  if (!form.value.htmlContent.trim()) {
    if (uploadType.value === 'paste') {
      errors.value.htmlContent = 'HTML 內容不能為空'
    } else {
      errors.value.file = '請選擇檔案'
    }
  }

  return Object.keys(errors.value).length === 0
}

// 提交表單
const handleSubmit = async () => {
  // 驗證表單
  if (!validateForm()) {
    return
  }

  isUploading.value = true
  uploadError.value = ''
  uploadSuccess.value = false

  try {
    const response = await $fetch<{ app: any; url: string }>('/api/apps', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        uploadType: uploadType.value,
        title: form.value.title,
        description: form.value.description || undefined,
        category: form.value.category || undefined,
        tags: form.value.tags.length > 0 ? form.value.tags : undefined,
        htmlContent: form.value.htmlContent
      }
    })

    // 上傳成功
    uploadSuccess.value = true
    uploadedUrl.value = response.url

    // 3 秒後跳轉到首頁或 app 詳情頁
    setTimeout(() => {
      router.push('/')
    }, 3000)
  } catch (error: any) {
    console.error('上傳失敗:', error)
    uploadError.value = error.data?.message || error.message || '上傳失敗，請稍後再試'
  } finally {
    isUploading.value = false
  }
}

// 重置表單
const handleReset = () => {
  form.value = {
    title: '',
    description: '',
    category: '',
    tags: [],
    htmlContent: ''
  }
  tagsInput.value = ''
  selectedFile.value = null
  errors.value = {}
  uploadError.value = ''
  uploadSuccess.value = false

  // 清除檔案輸入
  const fileInput = document.getElementById('fileInput') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}
</script>

<style scoped>
/* 滾動條樣式 */
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
