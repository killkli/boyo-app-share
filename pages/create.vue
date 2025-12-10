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
                <TabsList class="grid w-full grid-cols-2 p-1 bg-muted border-2 border-foreground">
                  <TabsTrigger value="paste"
                    class="font-bold uppercase tracking-wide data-[state=active]:bg-background data-[state=active]:shadow-brutal-sm data-[state=active]:border-2 data-[state=active]:border-foreground">
                    剪貼簿
                  </TabsTrigger>
                  <TabsTrigger value="file"
                    class="font-bold uppercase tracking-wide data-[state=active]:bg-background data-[state=active]:shadow-brutal-sm data-[state=active]:border-2 data-[state=active]:border-foreground">
                    上傳檔案
                  </TabsTrigger>
                </TabsList>

                <!-- Paste upload -->
                <TabsContent value="paste" class="space-y-4 mt-6">
                  <div class="space-y-2">
                    <Label for="htmlContent" class="text-sm font-bold uppercase tracking-wide">HTML 內容 *</Label>
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
import { ref, computed, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
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

// 定義頁面 meta
definePageMeta({
  middleware: 'auth' // 需要登入才能訪問
})

const { token } = useAuth()
const router = useRouter()
const { generateThumbnail, blobToBase64 } = useThumbnail()

// 上傳方式
const uploadType = ref<'paste' | 'file'>('paste')

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

  if (form.value.creators.length > 10) {
    errors.value.creators = '創作者最多 10 個'
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
    // 生成縮圖
    let thumbnailBase64: string | undefined
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
        creators: form.value.creators.length > 0 ? form.value.creators : undefined,
        htmlContent: form.value.htmlContent,
        thumbnailBase64: thumbnailBase64
      }
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

  // 清除檔案輸入
  const fileInput = document.getElementById('fileInput') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
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
