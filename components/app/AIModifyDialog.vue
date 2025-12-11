<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as="div">
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[700px] bg-white border-3 border-foreground shadow-brutal-lg max-h-[90vh] overflow-y-auto rounded-none z-[60]">
      <DialogHeader class="border-b-3 border-foreground pb-4 mb-4">
        <DialogTitle class="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
          <span class="text-2xl">⚡</span> AI Remix
        </DialogTitle>
        <DialogDescription class="text-base text-muted-foreground font-medium">
          基於目前應用進行修改或優化
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Loading State -->
        <div v-if="isLoadingSource" class="flex flex-col items-center justify-center p-12 space-y-4 bg-muted/20 border-3 border-dashed border-foreground/30">
          <div class="w-10 h-10 border-4 border-foreground border-t-transparent animate-spin"></div>
          <p class="font-bold uppercase tracking-wide">讀取代碼中...</p>
        </div>

        <!-- Main Content -->
        <div v-else class="space-y-6">
          <!-- Settings Toggle (Top Right) -->
          <div v-if="isConfigured && !showSettings" class="flex justify-end">
            <Button variant="ghost" size="sm" @click="toggleSettings" class="text-xs font-bold border-2 border-transparent hover:border-foreground uppercase tracking-wide">
              ⚙️ 設定 ({{ currentModelLabel }})
            </Button>
          </div>

           <!-- Settings Section -->
           <div v-if="!isConfigured || showSettings" class="space-y-5 p-6 bg-yellow-50 border-3 border-foreground shadow-brutal-sm">
            <div class="flex justify-between items-center border-b-2 border-foreground/20 pb-2">
              <h3 class="font-bold uppercase tracking-wide text-lg">⚙️ AI 設定</h3>
              <Button v-if="isConfigured" variant="ghost" size="sm" @click="showSettings = false" class="h-8 w-8 p-0 text-foreground hover:bg-foreground hover:text-background rounded-none">
                ✕
              </Button>
            </div>
            
            <div class="space-y-2">
              <Label for="apiKey" class="font-bold uppercase tracking-wide text-xs">Gemini API Key</Label>
              <Input 
                id="apiKey" 
                v-model="apiKey" 
                type="password" 
                placeholder="貼上你的 API Key" 
                class="border-2 border-foreground rounded-none focus:ring-0 focus:shadow-brutal-xs shadow-none"
              />
              <p class="text-xs text-muted-foreground font-mono mt-1">
                金鑰僅儲存於本地瀏覽器
                <a href="https://aistudio.google.com/app/apikey" target="_blank" class="underline font-bold text-primary hover:text-primary/80">取得金鑰 ↗</a>
              </p>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-baseline">
                <Label for="model" class="font-bold uppercase tracking-wide text-xs">模型</Label>
                <button @click="refreshModels" class="text-xs underline text-muted-foreground hover:text-foreground">重整列表</button>
              </div>
              <Select v-model="model">
                <SelectTrigger class="border-2 border-foreground rounded-none shadow-none focus:ring-0 focus:shadow-brutal-xs">
                  <SelectValue placeholder="選擇模型" />
                </SelectTrigger>
                <SelectContent class="border-2 border-foreground rounded-none shadow-brutal z-[100]">
                  <SelectItem v-for="m in availableModels" :key="m.value" :value="m.value" class="focus:bg-primary focus:text-primary-foreground rounded-none cursor-pointer">
                    {{ m.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Prompt Section -->
          <div v-else class="space-y-4">
            <div class="space-y-2">
              <Label class="font-bold uppercase tracking-wide text-sm">修改指令</Label>
              <Textarea 
                v-model="prompt" 
                placeholder="例如：把背景改成亮黃色，計分板加大，增加音效..." 
                rows="5"
                class="resize-none border-3 border-foreground rounded-none text-base p-4 focus:ring-0 focus:shadow-brutal-sm placeholder:text-muted-foreground/50 shadow-none font-medium"
              />
            </div>

            <!-- Code Stats -->
            <div class="flex items-center gap-2 text-xs font-mono border-l-4 border-foreground pl-3 py-1 bg-muted/30">
              <span class="font-bold">INPUT:</span>
              <span>{{ formatSize(sourceCode.length) }}</span>
              <span v-if="sourceCode.length > 30000" class="ml-auto text-amber-600 font-bold flex items-center gap-1">
                ⚠️ 大型檔案
              </span>
            </div>
          </div>
          
          <!-- Error -->
           <div v-if="error" class="p-4 bg-red-100 text-red-700 border-3 border-red-500 shadow-brutal-sm font-bold flex items-center gap-3">
            <span class="text-xl">💥</span>
            {{ error }}
          </div>
        </div>
      </div>

      <DialogFooter class="flex flex-col sm:flex-row gap-3 mt-6 border-t-3 border-foreground pt-6">
        <Button variant="outline" @click="isOpen = false" class="border-2 border-foreground font-bold uppercase tracking-wide rounded-none hover:bg-muted hover:text-foreground w-full sm:w-auto">
          取消
        </Button>
        
        <Button 
          v-if="!isLoadingSource && isConfigured && !showSettings" 
          @click="handleGenerate" 
          :disabled="isGenerating || !prompt.trim()"
          class="font-bold uppercase tracking-wide rounded-none shadow-brutal border-2 border-foreground hover:translate-y-1 hover:shadow-none transition-all w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <span v-if="isGenerating" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
            生成中...
          </span>
          <span v-else>開始 Remix ✨</span>
        </Button>
        
        <Button 
          v-else-if="(!isConfigured || showSettings) && !isLoadingSource"
          @click="saveSettings" 
          :disabled="!apiKey"
          class="font-bold uppercase tracking-wide rounded-none shadow-brutal border-2 border-foreground hover:translate-y-1 hover:shadow-none transition-all w-full sm:w-auto"
        >
          儲存設定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAISettings } from '~/composables/useAISettings'
import { useAI } from '~/composables/useAI'
import { useClientZip } from '~/composables/useClientZip'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const props = defineProps<{
  app: {
    id: string
    title: string
    html_s3_key: string
    upload_type: string
  }
}>()

const router = useRouter()
const config = useRuntimeConfig()
const { apiKey, model, availableModels, isConfigured } = useAISettings()
const { generate, listModels } = useAI()
const { unpackFiles } = useClientZip()

const isOpen = ref(false)
const showSettings = ref(false)
const isLoadingSource = ref(false)
const isGenerating = ref(false)
const prompt = ref('')
const error = ref('')
const sourceCode = ref('')

const currentModelLabel = computed(() => {
  const m = availableModels.value.find(m => m.value === model.value)
  return m ? m.label : model.value
})

// Load source code when dialog opens
watch(isOpen, async (val) => {
  if (val) {
    if (!sourceCode.value) {
      await fetchSourceCode()
    }
    // Refresh models if configured
    if (isConfigured.value) {
      await refreshModels()
    }
  }
})

// Reset source code when app changes
watch(() => props.app.id, () => {
  sourceCode.value = ''
})

const refreshModels = async () => {
  const models = await listModels()
  if (models.length > 0) {
    availableModels.value = models.map(m => ({
      value: m.name,
      label: m.displayName
    }))
    
    // Ensure current selection is valid
    if (!availableModels.value.find(m => m.value === model.value)) {
      model.value = availableModels.value[0].value
    }
  }
}

const toggleSettings = async () => {
  showSettings.value = !showSettings.value
  if (showSettings.value) {
    await refreshModels()
  }
}

const saveSettings = async () => {
  if (apiKey.value) {
    await refreshModels()
    showSettings.value = false
  }
}

const fetchSourceCode = async () => {
  isLoadingSource.value = true
  error.value = ''
  
  try {
    const url = `${config.public.s3BaseUrl}/${props.app.html_s3_key}`
    
    if (props.app.upload_type === 'zip') {
      const blob = await fetch(url).then(r => r.blob())
      const files = await unpackFiles(blob)
      let combined = ''
      for (const [path, content] of Object.entries(files)) {
        combined += `<file path="${path}">\n${content}\n</file>\n`
      }
      sourceCode.value = combined
    } else {
      const text = await fetch(url).then(r => r.text())
      sourceCode.value = text
    }
  } catch (e: any) {
    error.value = '無法讀取原始代碼: ' + e.message
  } finally {
    isLoadingSource.value = false
  }
}

const handleGenerate = async () => {
  if (!prompt.value.trim()) return
  
  isGenerating.value = true
  error.value = ''
  
  try {
    const systemPrompt = `
      You are an expert web developer maintained an existing application.
      Your task is to MODFIY the existing code based on the user's request.
      
      Rules:
      1. Return the FULL updated code. Do not return partial diffs.
      2. If the input was a single HTML file, return a single HTML file.
      3. If the input was a ZIP, try to merge them into a SINGLE HTML if possible, or return main HTML.
      4. Embed all resources (CSS/JS).
      5. Output ONLY the code.
    `
    
    const contextPrompt = `
      USER REQUEST:
      ${prompt.value}

      EXISTING CODE:
      ${sourceCode.value.slice(0, 150000)} ${sourceCode.value.length > 150000 ? '...(truncated)' : ''}
      
      Please provide the full updated HTML code:
    `
    
    const { text, usage } = await generate(contextPrompt, { systemPrompt })
    
    // Clean up
    let result = text.replace(/^```html\n/, '').replace(/```$/, '')
    
    // Save to session and navigate
    const importData = {
      code: result,
      title: props.app.title,
      prompt: prompt.value,
      usage: usage
    }
    
    sessionStorage.setItem('boyo-ai-import', JSON.stringify(importData))
    
    isOpen.value = false
    router.push('/create')
    
  } catch (e: any) {
    error.value = e.message || '生成失敗'
  } finally {
    isGenerating.value = false
  }
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  return (bytes / 1024).toFixed(1) + ' KB'
}
</script>

<style scoped>
/* Brutalist Animation Overrides */
.dialog-content {
  animation: brutal-slide 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes brutal-slide {
  from {
    transform: translate(-50%, -48%) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}
</style>
