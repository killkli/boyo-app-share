<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 載入狀態 -->
    <div v-if="loading" class="container mx-auto px-4 py-16 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">載入中...</p>
    </div>

    <!-- 錯誤或無權限 -->
    <div v-else-if="error || !canEdit" class="container mx-auto px-4 py-16 text-center">
      <div class="max-w-md mx-auto">
        <svg class="w-24 h-24 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          {{ error ? '載入失敗' : '無權限編輯' }}
        </h2>
        <p class="text-gray-600 mb-6">
          {{ error ? '此應用可能不存在或已被刪除' : '只有作者可以編輯此應用' }}
        </p>
        <div class="flex gap-4 justify-center">
          <Button variant="outline" @click="$router.back()">返回</Button>
          <Button as-child>
            <NuxtLink to="/explore">探索應用</NuxtLink>
          </Button>
        </div>
      </div>
    </div>

    <!-- 編輯表單 -->
    <div v-else-if="app" class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="mb-6">
        <Button variant="ghost" @click="$router.back()">
          ← 返回
        </Button>
      </div>

      <h1 class="text-3xl font-bold mb-8">編輯應用</h1>

      <Card>
        <CardHeader>
          <CardTitle>基本資訊</CardTitle>
          <CardDescription>
            更新你的應用資訊（不能修改上傳的檔案內容）
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-6">
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
              rows="4"
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

          <!-- Creators -->
          <div class="pt-4 border-t-2 border-muted">
            <CreatorInput v-model="form.creators" :error="errors.creators" />
          </div>

          <!-- HTML 重新上傳 -->
          <div class="border-t pt-6 mt-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold mb-2">HTML 內容管理</h3>
                <p class="text-sm text-muted-foreground">更新你的應用 HTML 內容</p>
              </div>
              <Dialog v-model:open="showReuploadDialog">
                <DialogTrigger as-child>
                  <Button variant="outline" class="font-bold uppercase tracking-wide">
                    重新上傳 HTML
                  </Button>
                </DialogTrigger>
                <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto !bg-white !text-black dark:!bg-white dark:!text-black">
                  <DialogHeader>
                    <DialogTitle class="text-2xl font-bold !text-black">重新上傳 HTML</DialogTitle>
                    <DialogDescription class="!text-gray-600">
                      上傳新的 HTML 內容將會替換現有的應用內容
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs v-model="reuploadType" class="w-full mt-4">
                    <TabsList class="grid w-full grid-cols-2 !bg-gray-100 !text-gray-700">
                      <TabsTrigger value="paste" class="data-[state=active]:!bg-white data-[state=active]:!text-black">剪貼簿</TabsTrigger>
                      <TabsTrigger value="file" class="data-[state=active]:!bg-white data-[state=active]:!text-black">上傳檔案</TabsTrigger>
                    </TabsList>

                    <!-- Paste upload -->
                    <TabsContent value="paste" class="space-y-4 mt-4">
                      <div class="space-y-2">
                        <Label for="reuploadHtmlContent" class="!text-black">HTML 內容 *</Label>
                        <Textarea
                          id="reuploadHtmlContent"
                          v-model="reuploadForm.htmlContent"
                          placeholder="<html>&#10;  <body>&#10;    <h1>Hello World!</h1>&#10;  </body>&#10;</html>"
                          rows="12"
                          class="font-mono text-sm !bg-white !text-black !border-gray-300"
                        />
                      </div>
                    </TabsContent>

                    <!-- File upload -->
                    <TabsContent value="file" class="space-y-4 mt-4">
                      <div class="space-y-2">
                        <Label for="reuploadFileInput" class="!text-black">選擇 HTML 檔案 *</Label>
                        <Input
                          id="reuploadFileInput"
                          type="file"
                          accept=".html,.htm"
                          class="!bg-white !text-black !border-gray-300"
                          @change="handleReuploadFileChange"
                        />
                        <p v-if="selectedFile" class="text-sm !text-gray-600">
                          已選擇: {{ selectedFile.name }}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div class="flex items-center space-x-2 pt-4 border-t !border-gray-300">
                    <input
                      id="regenerateThumbnail"
                      type="checkbox"
                      v-model="reuploadForm.regenerateThumbnail"
                      class="rounded !border-gray-300"
                    />
                    <Label for="regenerateThumbnail" class="cursor-pointer !text-black">
                      重新生成縮圖
                    </Label>
                  </div>

                  <DialogFooter class="flex gap-2">
                    <Button variant="outline" class="!border-gray-300 !text-black hover:!bg-gray-100" @click="showReuploadDialog = false">
                      取消
                    </Button>
                    <Button class="!bg-blue-600 !text-white hover:!bg-blue-700" @click="handleReupload" :disabled="reuploading">
                      {{ reuploading ? '上傳中...' : '確認上傳' }}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded">
              <div>
                <span class="text-gray-600">上傳方式:</span>
                <Badge variant="outline" class="ml-2">
                  {{ getUploadTypeLabel(app.upload_type) }}
                </Badge>
              </div>
              <div>
                <span class="text-gray-600">上傳日期:</span>
                <span class="ml-2">{{ formatDate(app.created_at) }}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex justify-between">
          <Button variant="outline" @click="handleCancel">
            取消
          </Button>
          <div class="flex gap-2">
            <Button variant="destructive" @click="handleDelete" :disabled="deleting">
              {{ deleting ? '刪除中...' : '刪除應用' }}
            </Button>
            <Button @click="handleSubmit" :disabled="saving">
              {{ saving ? '儲存中...' : '儲存變更' }}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CreatorInput from '~/components/common/CreatorInput.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth' // 需要登入
})

interface App {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  tags: string[]
  creators: string[]
  upload_type: string
  created_at: string
}

const route = useRoute()
const router = useRouter()
const { user, token } = useLegacyAuth()

const app = ref<App | null>(null)
const loading = ref(true)
const error = ref(false)
const saving = ref(false)
const deleting = ref(false)

const form = ref({
  title: '',
  description: '',
  category: '',
  tags: [] as string[],
  creators: [] as string[]
})

const tagsInput = ref('')
const errors = ref<Record<string, string>>({})

// HTML 重新上傳相關狀態
const showReuploadDialog = ref(false)
const reuploadType = ref<'paste' | 'file'>('paste')
const reuploadForm = ref({
  htmlContent: '',
  regenerateThumbnail: false
})
const selectedFile = ref<File | null>(null)
const reuploading = ref(false)

// 判斷是否可編輯
const canEdit = computed(() => {
  if (!user.value || !app.value) return false
  return user.value.id === app.value.user_id
})

// 監聽標籤輸入
watch(tagsInput, (value) => {
  const tags = value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10)
  form.value.tags = tags
})

// 獲取 App 資料
const fetchApp = async () => {
  try {
    loading.value = true
    error.value = false

    const appId = route.params.id as string
    const response = await $fetch<{ app: App }>(`/api/apps/${appId}`)
    app.value = response.app

    // 預填表單
    form.value.title = app.value.title
    form.value.description = app.value.description || ''
    form.value.category = app.value.category || ''
    form.value.tags = app.value.tags || []
    form.value.creators = app.value.creators || []
    tagsInput.value = form.value.tags.join(', ')
  } catch (err) {
    console.error('Failed to fetch app:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 驗證表單
const validateForm = () => {
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = '標題不能為空'
  }

  if (form.value.tags.length > 10) {
    errors.value.tags = '標籤最多 10 個'
  }

  if (form.value.creators.length > 10) {
    errors.value.creators = '創作者最多 10 個'
  }

  return Object.keys(errors.value).length === 0
}

// 提交表單
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    saving.value = true

    const appId = route.params.id as string
    await $fetch(`/api/apps/${appId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        title: form.value.title,
        description: form.value.description || null,
        category: form.value.category || null,
        tags: form.value.tags,
        creators: form.value.creators
      }
    } as any)

    // 成功後跳轉到詳情頁
    router.push(`/app/${appId}`)
  } catch (err: any) {
    console.error('Failed to update app:', err)
    errors.value.submit = err.data?.message || '更新失敗，請稍後再試'
  } finally {
    saving.value = false
  }
}

// 取消編輯
const handleCancel = () => {
  router.back()
}

// 刪除應用
const handleDelete = async () => {
  if (!confirm('確定要刪除此應用嗎？此操作無法復原。')) {
    return
  }

  try {
    deleting.value = true

    const appId = route.params.id as string
    await $fetch(`/api/apps/${appId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    } as any)

    // 刪除成功後跳轉到首頁
    router.push('/')
  } catch (err: any) {
    console.error('Failed to delete app:', err)
    alert(err.data?.message || '刪除失敗，請稍後再試')
  } finally {
    deleting.value = false
  }
}

// 輔助函數
const getUploadTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    paste: '剪貼簿',
    file: '單檔上傳',
    zip: 'ZIP 壓縮檔'
  }
  return labels[type] || type
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 處理重新上傳檔案選擇
const handleReuploadFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    selectedFile.value = file

    // 讀取檔案內容
    const reader = new FileReader()
    reader.onload = (e) => {
      reuploadForm.value.htmlContent = e.target?.result as string
    }
    reader.readAsText(file)
  }
}

// 處理重新上傳
const handleReupload = async () => {
  if (!reuploadForm.value.htmlContent.trim()) {
    alert('請輸入或選擇 HTML 內容')
    return
  }

  if (!confirm('確定要重新上傳 HTML 嗎？這將會替換現有的內容。')) {
    return
  }

  try {
    reuploading.value = true

    const appId = route.params.id as string
    await $fetch(`/api/apps/${appId}/reupload`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        htmlContent: reuploadForm.value.htmlContent,
        regenerateThumbnail: reuploadForm.value.regenerateThumbnail
      }
    })

    // 重新上傳成功
    showReuploadDialog.value = false
    reuploadForm.value = {
      htmlContent: '',
      regenerateThumbnail: false
    }
    selectedFile.value = null

    // 顯示成功訊息並導航到檢視頁面
    alert('HTML 內容已成功更新！')
    // 導航到檢視頁面，強制重新載入資料
    router.push(`/app/${appId}?t=${Date.now()}`)
  } catch (err: any) {
    console.error('Failed to reupload:', err)
    alert(err.data?.message || '重新上傳失敗，請稍後再試')
  } finally {
    reuploading.value = false
  }
}

onMounted(() => {
  fetchApp()
})
</script>
