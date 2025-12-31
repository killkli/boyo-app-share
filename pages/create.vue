<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Header - Brutalist Style -->
      <div class="mb-10 border-b-4 border-foreground pb-6">
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Create</span>
        <h1 class="text-5xl md:text-6xl font-heading font-bold mb-3">
          建立新應用
        </h1>
        <p class="mt-4 text-lg text-muted-foreground font-medium">
          分享你的創意，讓更多人看見
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left: Form -->
        <div class="space-y-6">
          <Card class="border-3 border-foreground shadow-brutal">
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <CardTitle class="text-2xl font-bold uppercase tracking-wide">APP 資訊</CardTitle>
              <CardDescription class="text-base">填寫你的 HTML App 基本資訊</CardDescription>
            </CardHeader>
            <CardContent class="space-y-5 pt-6">
              <!-- Title -->
              <div class="space-y-2">
                <Label for="title" class="text-sm font-bold uppercase tracking-wide">標題 *</Label>
                <Input id="title" v-model="form.title" placeholder="我的超酷 HTML App" class="text-base"
                  :class="{ 'border-red-500 focus:border-red-500': errors.title }" />
                <p v-if="errors.title" class="text-sm text-red-500 font-medium">{{ errors.title }}</p>
              </div>

              <!-- Description -->
              <div class="space-y-2">
                <Label for="description" class="text-sm font-bold uppercase tracking-wide">描述</Label>
                <Textarea id="description" v-model="form.description" placeholder="這是一個簡單又有趣的 HTML App..." rows="3"
                  class="resize-none text-base" />
              </div>

              <!-- Category -->
              <div class="space-y-2">
                <Label for="category" class="text-sm font-bold uppercase tracking-wide">分類</Label>
                <Select v-model="form.category">
                  <SelectTrigger id="category">
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

              <!-- Tags -->
              <div class="space-y-2">
                <Label for="tags" class="text-sm font-bold uppercase tracking-wide">標籤 (逗號分隔，最多 10 個)</Label>
                <Input id="tags" v-model="tagsInput" placeholder="javascript, html, css"
                  class="text-base" />
                <div class="flex items-center justify-between">
                  <p class="text-sm font-mono text-muted-foreground">
                    目前標籤: <span class="text-primary font-bold">{{ form.tags.length }}</span> / 10
                  </p>
                  <p v-if="errors.tags" class="text-sm text-red-500 font-medium">{{ errors.tags }}</p>
                </div>
              </div>

              <!-- Creators -->
              <div class="pt-4 border-t-2 border-muted">
                <CreatorInput v-model="form.creators" :error="errors.creators" />
              </div>
            </CardContent>
          </Card>

          <!-- Upload Method -->
          <Card class="border-3 border-foreground shadow-brutal">
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <CardTitle class="text-2xl font-bold uppercase tracking-wide">上傳方式</CardTitle>
              <CardDescription class="text-base">選擇如何上傳你的 HTML App</CardDescription>
            </CardHeader>
            <CardContent class="pt-6">
              <Tabs v-model="uploadType" class="w-full">
                <TabsList class="grid w-full grid-cols-3 p-1 bg-muted border-2 border-foreground">
                  <TabsTrigger value="paste"
                    class="font-bold uppercase tracking-wide text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-brutal-sm data-[state=active]:border-2 data-[state=active]:border-foreground">
                    剪貼簿
                  </TabsTrigger>
                  <TabsTrigger value="file"
                    class="font-bold uppercase tracking-wide text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-brutal-sm data-[state=active]:border-2 data-[state=active]:border-foreground">
                    上傳檔案
                  </TabsTrigger>
                  <TabsTrigger value="zip"
                    class="font-bold uppercase tracking-wide text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-brutal-sm data-[state=active]:border-2 data-[state=active]:border-foreground">
                    壓縮檔
                  </TabsTrigger>
                </TabsList>

                <!-- Paste upload -->
                <TabsContent value="paste" class="space-y-4 mt-6">
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <Label for="htmlContent" class="text-sm font-bold uppercase tracking-wide">HTML 內容 *</Label>
                      <AICreateDialog @generated="handleAiGenerated">
        <Button variant="outline" size="sm" type="button" class="h-8 gap-2 text-primary border-primary hover:bg-primary hover:text-white font-bold">
          ✨ AI 生成
        </Button>
      </AICreateDialog>
    </div>
    
    <!-- Token Usage Stats -->
    <div v-if="lastUsage" class="bg-muted/50 p-3 text-xs font-mono border-l-4 border-primary flex gap-4 animate-fade-in">
      <span class="font-bold">✨ Generation Stats:</span>
      <span>Input Tok: {{ lastUsage.promptTokenCount }}</span>
      <span>Output Tok: {{ lastUsage.candidatesTokenCount }}</span>
      <span class="ml-auto text-muted-foreground">{{ new Date().toLocaleTimeString() }}</span>
    </div>

    <Textarea id="htmlContent" v-model="form.htmlContent"
                      placeholder="<html>&#10;  <body>&#10;    <h1>Hello World!</h1>&#10;  </body>&#10;</html>"
                      rows="12" class="font-mono text-sm resize-none"
                      :class="{ 'border-red-500 focus:border-red-500': errors.htmlContent }" />
                    <p v-if="errors.htmlContent" class="text-sm text-red-500 font-medium">{{ errors.htmlContent }}</p>
                  </div>
                </TabsContent>

                <!-- File upload -->
                <TabsContent value="file" class="space-y-4 mt-6">
                  <div class="space-y-2">
                    <Label for="fileInput" class="text-sm font-bold uppercase tracking-wide">選擇 HTML 檔案 *</Label>
                    <Input id="fileInput" type="file" accept=".html,.htm"
                      class="cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-2 file:border-foreground file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      @change="handleFileChange" :class="{ 'border-red-500': errors.file }" />
                    <p v-if="selectedFile" class="text-sm font-mono text-primary font-medium">
                      已選擇: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                    </p>
                    <p v-if="errors.file" class="text-sm text-red-500 font-medium">{{ errors.file }}</p>
                  </div>
                </TabsContent>

                <!-- ZIP upload -->
                <TabsContent value="zip" class="space-y-4 mt-6">
                  <div class="space-y-4">
                    <Label class="text-sm font-bold uppercase tracking-wide">選擇 ZIP 壓縮檔 *</Label>

                    <!-- Drop Zone -->
                    <div
                      class="relative border-3 border-dashed border-foreground p-8 text-center cursor-pointer transition-colors hover:bg-muted/50"
                      :class="{
                        'border-primary bg-primary/5': isDraggingZip,
                        'border-red-500': errors.zip
                      }"
                      @dragover.prevent="isDraggingZip = true"
                      @dragleave.prevent="isDraggingZip = false"
                      @drop.prevent="handleZipDrop"
                      @click="triggerZipInput"
                    >
                      <input
                        ref="zipInputRef"
                        type="file"
                        accept=".zip"
                        class="hidden"
                        @change="handleZipChange"
                      />

                      <div class="space-y-3">
                        <div class="w-16 h-16 mx-auto border-3 border-foreground bg-muted flex items-center justify-center">
                          <span class="text-3xl">📦</span>
                        </div>
                        <div>
                          <p class="font-bold text-lg uppercase tracking-wide">
                            {{ isDraggingZip ? '放開以上傳' : '拖放 ZIP 檔案至此' }}
                          </p>
                          <p class="text-sm text-muted-foreground mt-1">或點擊選擇檔案</p>
                        </div>
                        <div class="text-xs text-muted-foreground space-y-1">
                          <p>支援 .zip 格式，最大 50MB</p>
                          <p>ZIP 須包含 index.html 作為入口檔案</p>
                        </div>
                      </div>
                    </div>

                    <!-- Selected file info -->
                    <div v-if="selectedZipFile" class="p-4 bg-muted border-2 border-foreground">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span class="text-2xl">📦</span>
                          <div>
                            <p class="font-bold font-mono">{{ selectedZipFile.name }}</p>
                            <p class="text-sm text-muted-foreground">{{ formatFileSize(selectedZipFile.size) }}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="clearZipFile"
                          class="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          移除
                        </Button>
                      </div>
                      <div v-if="zipProcessing" class="mt-3">
                        <div class="h-2 bg-muted-foreground/20 overflow-hidden">
                          <div class="h-full bg-primary animate-pulse w-full"></div>
                        </div>
                        <p class="text-xs text-muted-foreground mt-1">處理中...</p>
                      </div>
                    </div>

                    <p v-if="errors.zip" class="text-sm text-red-500 font-medium">{{ errors.zip }}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <!-- Action buttons -->
          <div class="flex gap-4">
            <Button @click="handleSubmit" :disabled="isUploading"
              class="flex-1 font-bold text-lg py-6 uppercase tracking-wide">
              <span v-if="isUploading" class="flex items-center gap-2">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white animate-spin"></div>
                上傳中
              </span>
              <span v-else>
                上傳 APP
              </span>
            </Button>
            <Button variant="outline" @click="handleReset" :disabled="isUploading"
              class="font-bold text-base px-8 py-6 uppercase tracking-wide">
              重置
            </Button>
          </div>

          <!-- Error message -->
          <div v-if="uploadError" class="p-5 bg-red-50 border-3 border-red-500 shadow-brutal">
            <p class="font-bold text-red-700 mb-1 uppercase tracking-wide">上傳失敗</p>
            <p class="text-sm text-red-600">{{ uploadError }}</p>
          </div>

          <!-- Success message -->
          <div v-if="uploadSuccess" class="p-5 bg-green-50 border-3 border-green-500 shadow-brutal space-y-3">
            <p class="font-bold text-green-700 mb-2 uppercase tracking-wide">上傳成功！</p>
            <NuxtLink :to="uploadedUrl"
              class="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 hover:underline uppercase tracking-wide">
              查看 APP 詳情 →
            </NuxtLink>
          </div>
        </div>

        <!-- Right: Live Preview -->
        <div class="space-y-4">
          <Card class="sticky top-4 border-3 border-foreground shadow-brutal-lg">
            <CardHeader class="bg-muted border-b-3 border-foreground">
              <CardTitle class="text-2xl font-bold uppercase tracking-wide">即時預覽</CardTitle>
              <CardDescription class="text-base">查看你的 HTML App 渲染效果</CardDescription>
            </CardHeader>
            <CardContent class="p-6">
              <AppPreview v-if="form.htmlContent" :html-content="form.htmlContent" />
              <div v-else
                class="w-full h-[400px] border-3 border-dashed border-foreground flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                <div class="w-16 h-16 border-3 border-foreground bg-muted mb-4"></div>
                <p class="font-bold text-lg uppercase tracking-wide">等待 HTML 內容</p>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThumbnail } from '~/composables/useThumbnail'
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
import CreatorInput from '~/components/common/CreatorInput.vue'
import AICreateDialog from '~/components/app/AICreateDialog.vue'

// 定義頁面 meta
definePageMeta({
  middleware: 'auth' // 需要登入才能訪問
})

const { getAuthHeaders } = useApiAuth()
const router = useRouter()
const { generateThumbnail, blobToBase64 } = useThumbnail()

// 上傳方式
const uploadType = ref<'paste' | 'file' | 'zip'>('paste')

// 表單資料
const form = ref({
  title: '',
  description: '',
  category: '',
  tags: [] as string[],
  creators: [] as string[],
  htmlContent: ''
})

// 標籤輸入
const tagsInput = ref('')

// 統計數據
const lastUsage = ref<{ promptTokenCount: number, candidatesTokenCount: number } | null>(null)

// 監聽 AI 生成事件
const handleAiGenerated = (code: string, prompt: string, usage?: any) => {
  form.value.htmlContent = code
  
  let desc = `AI Generation Prompt: ${prompt}`
  if (usage) {
    lastUsage.value = usage
    desc += `\n\nToken Usage: Input ${usage.promptTokenCount} / Output ${usage.candidatesTokenCount}`
  }
  
  // Append to existing description or set new
  if (form.value.description) {
    form.value.description += `\n\n${desc}`
  } else {
    form.value.description = desc
  }
}

onMounted(() => {
  // 檢查是否有 AI 生成/修改的導入代碼
  try {
    const importedData = sessionStorage.getItem('boyo-ai-import')
    if (importedData) {
      const data = JSON.parse(importedData)
      if (data.code) {
        form.value.htmlContent = data.code
        uploadType.value = 'paste'
        
        if (data.title) {
          form.value.title = `${data.title} (AI Remix)`
          let desc = `Based on: ${data.title}\nAI Modification: ${data.prompt || 'Remix'}`
          
          if (data.usage) {
            desc += `\n\nToken Usage: Input ${data.usage.promptTokenCount} / Output ${data.usage.candidatesTokenCount}`
            lastUsage.value = data.usage
          }
          
          form.value.description = desc
        }
      }
      // 清除，避免重整後重複載入
      sessionStorage.removeItem('boyo-ai-import')
    }
  } catch (e) {
    console.error('Failed to load imported AI data', e)
  }
})

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

// ZIP 上傳
const selectedZipFile = ref<File | null>(null)
const zipContent = ref<string>('')
const zipProcessing = ref(false)
const isDraggingZip = ref(false)
const zipInputRef = ref<HTMLInputElement | null>(null)

const MAX_ZIP_SIZE = 50 * 1024 * 1024 // 50MB

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

// ZIP 檔案處理
const triggerZipInput = () => {
  zipInputRef.value?.click()
}

const processZipFile = async (file: File) => {
  // 檢查檔案類型
  if (!file.name.toLowerCase().endsWith('.zip')) {
    errors.value.zip = '請選擇 .zip 格式的檔案'
    return
  }

  // 檢查檔案大小
  if (file.size > MAX_ZIP_SIZE) {
    errors.value.zip = `ZIP 檔案不能超過 ${formatFileSize(MAX_ZIP_SIZE)}`
    return
  }

  selectedZipFile.value = file
  zipProcessing.value = true
  errors.value.zip = ''

  try {
    // 轉換為 base64
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    zipContent.value = btoa(binary)
  } catch (error) {
    console.error('ZIP 處理失敗:', error)
    errors.value.zip = 'ZIP 檔案處理失敗，請重試'
    selectedZipFile.value = null
    zipContent.value = ''
  } finally {
    zipProcessing.value = false
  }
}

const handleZipChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await processZipFile(file)
  }
}

const handleZipDrop = async (event: DragEvent) => {
  isDraggingZip.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    await processZipFile(file)
  }
}

const clearZipFile = () => {
  selectedZipFile.value = null
  zipContent.value = ''
  errors.value.zip = ''
  if (zipInputRef.value) {
    zipInputRef.value.value = ''
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

  if (form.value.creators.length > 10) {
    errors.value.creators = '創作者最多 10 個'
  }

  // 根據上傳類型驗證內容
  if (uploadType.value === 'zip') {
    if (!zipContent.value) {
      errors.value.zip = '請選擇 ZIP 檔案'
    }
  } else if (!form.value.htmlContent.trim()) {
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
    // 生成縮圖（僅適用於 paste 和 file 模式）
    let thumbnailBase64: string | undefined
    if (uploadType.value !== 'zip' && form.value.htmlContent) {
      try {
        const thumbnailBlob = await generateThumbnail(form.value.htmlContent, {
          width: 1200,
          height: 630
        })
        thumbnailBase64 = await blobToBase64(thumbnailBlob)
      } catch (error) {
        console.warn('縮圖生成失敗，將繼續上傳:', error)
        // 縮圖生成失敗不應阻止上傳
      }
    }

    // 根據上傳類型構建請求 body
    const requestBody: Record<string, any> = {
      uploadType: uploadType.value,
      title: form.value.title,
      description: form.value.description || undefined,
      category: form.value.category || undefined,
      tags: form.value.tags.length > 0 ? form.value.tags : undefined,
      creators: form.value.creators.length > 0 ? form.value.creators : undefined
    }

    if (uploadType.value === 'zip') {
      requestBody.zipContent = zipContent.value
    } else {
      requestBody.htmlContent = form.value.htmlContent
      requestBody.thumbnailBase64 = thumbnailBase64
    }

    const response = await $fetch<{ app: any; url: string }>('/api/apps', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: requestBody
    })

    // 上傳成功 - 使用應用詳情頁的URL
    uploadSuccess.value = true
    uploadedUrl.value = `/app/${response.app.id}`
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
    creators: [],
    htmlContent: ''
  }
  tagsInput.value = ''
  selectedFile.value = null
  errors.value = {}
  uploadError.value = ''
  uploadSuccess.value = false

  // 清除 HTML 檔案輸入
  const fileInput = document.getElementById('fileInput') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }

  // 清除 ZIP 檔案
  clearZipFile()
}
</script>

<style scoped>
/* Add spin animation for loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
