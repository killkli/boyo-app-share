<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <h1 class="text-3xl font-bold mb-8">上傳新的 HTML App</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 左側：表單 -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>App 資訊</CardTitle>
            <CardDescription>填寫你的 HTML App 基本資訊</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- 標題 -->
            <div class="space-y-2">
              <Label for="title">標題 *</Label>
              <Input
                id="title"
                v-model="form.title"
                placeholder="我的 HTML App"
                :class="{ 'border-red-500': errors.title }"
              />
              <p v-if="errors.title" class="text-sm text-red-500">{{ errors.title }}</p>
            </div>

            <!-- 描述 -->
            <div class="space-y-2">
              <Label for="description">描述</Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="這是一個簡單的 HTML App..."
                rows="3"
              />
            </div>

            <!-- 分類 -->
            <div class="space-y-2">
              <Label for="category">分類</Label>
              <Select v-model="form.category">
                <SelectTrigger>
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tool">工具</SelectItem>
                  <SelectItem value="game">遊戲</SelectItem>
                  <SelectItem value="demo">展示</SelectItem>
                  <SelectItem value="experiment">實驗</SelectItem>
                  <SelectItem value="education">教育</SelectItem>
                  <SelectItem value="art">藝術</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- 標籤 -->
            <div class="space-y-2">
              <Label for="tags">標籤 (逗號分隔，最多 10 個)</Label>
              <Input
                id="tags"
                v-model="tagsInput"
                placeholder="javascript, html, css"
              />
              <p class="text-sm text-gray-500">目前標籤: {{ form.tags.length }} / 10</p>
              <p v-if="errors.tags" class="text-sm text-red-500">{{ errors.tags }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- 上傳方式 -->
        <Card>
          <CardHeader>
            <CardTitle>上傳方式</CardTitle>
            <CardDescription>選擇如何上傳你的 HTML App</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs v-model="uploadType" class="w-full">
              <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="paste">剪貼簿</TabsTrigger>
                <TabsTrigger value="file">上傳檔案</TabsTrigger>
              </TabsList>

              <!-- 剪貼簿上傳 -->
              <TabsContent value="paste" class="space-y-4">
                <div class="space-y-2">
                  <Label for="htmlContent">HTML 內容 *</Label>
                  <Textarea
                    id="htmlContent"
                    v-model="form.htmlContent"
                    placeholder="貼上你的 HTML 程式碼..."
                    rows="12"
                    class="font-mono text-sm"
                    :class="{ 'border-red-500': errors.htmlContent }"
                  />
                  <p v-if="errors.htmlContent" class="text-sm text-red-500">{{ errors.htmlContent }}</p>
                </div>
              </TabsContent>

              <!-- 檔案上傳 -->
              <TabsContent value="file" class="space-y-4">
                <div class="space-y-2">
                  <Label for="fileInput">選擇 HTML 檔案 *</Label>
                  <Input
                    id="fileInput"
                    type="file"
                    accept=".html,.htm"
                    @change="handleFileChange"
                    :class="{ 'border-red-500': errors.file }"
                  />
                  <p v-if="selectedFile" class="text-sm text-gray-500">
                    已選擇: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                  </p>
                  <p v-if="errors.file" class="text-sm text-red-500">{{ errors.file }}</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <!-- 提交按鈕 -->
        <div class="flex gap-4">
          <Button
            @click="handleSubmit"
            :disabled="isUploading"
            class="flex-1"
          >
            <span v-if="isUploading">上傳中...</span>
            <span v-else>上傳 App</span>
          </Button>
          <Button
            variant="outline"
            @click="handleReset"
            :disabled="isUploading"
          >
            重置
          </Button>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="uploadError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ uploadError }}</p>
        </div>

        <!-- 成功訊息 -->
        <div v-if="uploadSuccess" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600 mb-2">上傳成功！</p>
          <a :href="uploadedUrl" target="_blank" class="text-sm text-blue-600 hover:underline">
            查看你的 App →
          </a>
        </div>
      </div>

      <!-- 右側：即時預覽 -->
      <div class="space-y-4">
        <Card class="sticky top-4">
          <CardHeader>
            <CardTitle>即時預覽</CardTitle>
            <CardDescription>查看你的 HTML App 渲染效果</CardDescription>
          </CardHeader>
          <CardContent>
            <AppPreview v-if="form.htmlContent" :html-content="form.htmlContent" />
            <div v-else class="w-full h-[400px] border rounded-lg flex items-center justify-center text-gray-400">
              <p>等待 HTML 內容...</p>
            </div>
          </CardContent>
        </Card>
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
