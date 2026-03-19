<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as="div">
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[700px] bg-white border-3 border-foreground shadow-brutal-lg max-h-[90vh] overflow-y-auto rounded-none z-[60]">
      <DialogHeader class="border-b-3 border-foreground pb-4 mb-4">
        <DialogTitle class="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
          <span class="text-2xl">✨</span> AI 助手
        </DialogTitle>
        <DialogDescription class="text-base text-muted-foreground font-medium">
          輸入描述，讓 AI 為你生成 HTML App
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
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

        <!-- Generation Section -->
        <div v-else class="space-y-4">
          <div class="space-y-2">
            <Label class="font-bold uppercase tracking-wide text-sm">創意描述</Label>
            <Textarea 
              v-model="prompt" 
              placeholder="例如：做一個復古風格的彈珠台遊戲……" 
              rows="6"
              class="resize-none border-3 border-foreground rounded-none text-base p-4 focus:ring-0 focus:shadow-brutal-sm placeholder:text-muted-foreground/50 shadow-none font-medium"
            />
          </div>
          
          <div class="flex gap-2 text-xs font-mono p-3 bg-muted/30 border-l-4 border-foreground">
            <span class="font-bold">✨ TIP:</span>
            <span>描述越詳細，生成結果越好。可以指定顏色、玩法、規則等。</span>
          </div>
        </div>

        <!-- Error Message -->
         <div v-if="error" class="p-4 bg-red-100 text-red-700 border-3 border-red-500 shadow-brutal-sm font-bold flex items-center gap-3">
            <span class="text-xl">💥</span>
            {{ error }}
        </div>
      </div>

      <DialogFooter class="flex flex-col sm:flex-row gap-3 mt-6 border-t-3 border-foreground pt-6">
        <Button variant="outline" @click="isOpen = false" class="border-2 border-foreground font-bold uppercase tracking-wide rounded-none hover:bg-muted hover:text-foreground w-full sm:w-auto">
          取消
        </Button>
        
        <Button 
          v-if="isConfigured && !showSettings" 
          @click="handleGenerate" 
          :disabled="isGenerating || !prompt.trim()"
          class="font-bold uppercase tracking-wide rounded-none shadow-brutal border-2 border-foreground hover:translate-y-1 hover:shadow-none transition-all w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <span v-if="isGenerating" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
            生成中……
          </span>
          <span v-else>開始生成 ✨</span>
        </Button>
        
        <Button 
          v-else 
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
import { useAISettings } from '~/composables/useAISettings'
import { useAI } from '~/composables/useAI'
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

const emit = defineEmits<{
  (e: 'generated', code: string, prompt: string, usage?: any): void
}>()

const isOpen = ref(false)
const showSettings = ref(false)
const prompt = ref('')
const isGenerating = ref(false)
const error = ref('')

// AI Comopsables
const { apiKey, model, availableModels, isConfigured } = useAISettings()
const { generate, listModels } = useAI()

const currentModelLabel = computed(() => {
  const m = availableModels.value.find(m => m.value === model.value)
  return m ? m.label : model.value
})

const toggleSettings = async () => {
  showSettings.value = !showSettings.value
  if (showSettings.value) {
    await refreshModels()
  }
}

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

const saveSettings = async () => {
  if (apiKey.value) {
    await refreshModels()
    showSettings.value = false
  }
}

// Watch initial open
watch(isOpen, async (val) => {
  if (val && isConfigured.value) {
      await refreshModels()
  }
})

const handleGenerate = async () => {
  if (!prompt.value.trim()) return
  
  isGenerating.value = true
  error.value = ''
  
  try {
    const systemPrompt = `
      You are an expert Frontend Developer and Code Generator.
      Your task is to generate a SINGLE text file containing a complete, runnable HTML application.
      
      Requirements:
      1. Use Tailwind CSS for styling (via CDN).
      2. make sure the app looks modern, clean, and has a "Brutalist Light" aesthetic (white background, black borders, sharp edges).
      3. DO NOT include any markdown formatting (like \`\`\`html or \`\`\`).
      4. DO NOT include any explanations, introductions, or concluding remarks.
      5. OUTPUT ONLY THE RAW HTML CODE. The output must start with <!DOCTYPE html> and end with </html>.
    `
    
    const { text, usage } = await generate(prompt.value, { systemPrompt })
    
    // Clean up markdown code blocks if present
    let result = text.replace(/^```html\n/, '').replace(/```$/, '')
    
    emit('generated', result, prompt.value, usage)
    isOpen.value = false
    prompt.value = '' 
  } catch (e: any) {
    error.value = e.message || '生成失敗，請檢查 API Key 或網路連線'
  } finally {
    isGenerating.value = false
  }
}
</script>
