<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Label class="text-sm font-bold uppercase tracking-wide">創作者 (可選)</Label>
      <div class="text-sm font-mono text-muted-foreground">
        <span class="text-primary font-bold">{{ creators.length }}</span> / 10
      </div>
    </div>

    <p class="text-sm text-muted-foreground">
      添加參與此作品的創作者名稱（例如：團隊成員、合作者）
    </p>

    <!-- Creator list -->
    <div v-if="creators.length > 0" class="space-y-3">
      <div
        v-for="(creator, index) in creators"
        :key="index"
        class="bg-muted border-2 border-foreground p-3 space-y-2"
      >
        <!-- Name input row -->
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm text-muted-foreground font-bold">{{ index + 1 }}.</span>
          <Input
            v-model="creators[index].name"
            placeholder="創作者名稱"
            class="flex-1"
            maxlength="100"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            class="shrink-0 border-2"
            :class="{ 'bg-primary text-primary-foreground': expandedLinks.has(index) }"
            @click.prevent="toggleLinkInput(index)"
            title="添加連結"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            class="shrink-0 border-2"
            @click.prevent="removeCreator(index)"
            :disabled="creators.length === 1 && !creators[0].name"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <!-- Link input (collapsible) -->
        <div v-if="expandedLinks.has(index)" class="pl-6 space-y-1">
          <div class="flex items-center gap-2">
            <Input
              v-model="creators[index].link"
              placeholder="https://example.com"
              class="flex-1"
              maxlength="500"
              :class="{ 'border-red-500': creators[index].link && !isValidUrl(creators[index].link || '') }"
            />
          </div>
          <p v-if="creators[index].link && !isValidUrl(creators[index].link || '')" class="text-xs text-red-500 font-medium">
            請輸入有效的 URL（以 http:// 或 https:// 開頭）
          </p>
          <p v-else class="text-xs text-muted-foreground">
            個人網站、社群媒體或作品集連結（可選）
          </p>
        </div>
      </div>
    </div>

    <!-- Add creator button -->
    <Button
      type="button"
      variant="outline"
      size="sm"
      class="w-full font-bold uppercase tracking-wide border-2 border-dashed"
      :disabled="creators.length >= 10"
      @click.prevent="addCreator"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      添加創作者
    </Button>

    <!-- Error message -->
    <p v-if="error" class="text-sm text-red-500 font-medium">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// 創作者資料類型
interface CreatorWithLink {
  name: string
  link?: string
}

type CreatorInput = string | CreatorWithLink

interface Props {
  modelValue: CreatorInput[]
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: CreatorInput[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  error: ''
})

const emit = defineEmits<Emits>()

// 標準化創作者輸入
const normalizeCreator = (input: CreatorInput): CreatorWithLink => {
  if (typeof input === 'string') {
    return { name: input }
  }
  return {
    name: input.name || '',
    link: input.link || undefined
  }
}

// 本地創作者列表（統一為物件格式）
const creators = ref<CreatorWithLink[]>(
  props.modelValue.length > 0
    ? props.modelValue.map(normalizeCreator)
    : [{ name: '' }]
)

// 追蹤每個創作者的連結輸入展開狀態
const expandedLinks = ref<Set<number>>(new Set())

// 如果初始值為空，添加一個空項
if (creators.value.length === 0) {
  creators.value = [{ name: '' }]
}

// 監聽 props 變化
watch(() => props.modelValue, (newValue) => {
  const normalized = newValue.length > 0
    ? newValue.map(normalizeCreator)
    : [{ name: '' }]

  // 計算當前本地狀態過濾後的值（與 emit 邏輯一致）
  const currentFiltered = creators.value
    .map(c => ({
      name: c.name.trim(),
      link: c.link?.trim() || undefined
    }))
    .filter(c => c.name.length > 0)
    .map(c => {
      if (!c.link) {
        return c.name
      }
      return c
    })

  // 比較過濾後的本地值和新的 props 值，而不是原始本地值
  // 這樣可以避免因為有空項目而觸發不必要的重置
  const isDifferent = JSON.stringify(currentFiltered) !== JSON.stringify(newValue)

  if (isDifferent) {
    creators.value = normalized
    // 如果有連結，自動展開對應項
    creators.value.forEach((c, index) => {
      if (c.link) {
        expandedLinks.value.add(index)
      }
    })
  }
}, { deep: true })

// 監聽本地變化，發送到父組件
let updateTimeout: NodeJS.Timeout | null = null
watch(creators, (newValue) => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  updateTimeout = setTimeout(() => {
    // 過濾掉空名稱的項目，轉換為 API 格式
    const filtered = newValue
      .map(c => ({
        name: c.name.trim(),
        link: c.link?.trim() || undefined
      }))
      .filter(c => c.name.length > 0)
      .map(c => {
        // 如果沒有連結，返回純字串（向後兼容）
        if (!c.link) {
          return c.name
        }
        return c
      })

    emit('update:modelValue', filtered)
  }, 0)
}, { deep: true })

// URL 驗證
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true // 空值是有效的
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// 切換連結輸入展開狀態
const toggleLinkInput = (index: number) => {
  if (expandedLinks.value.has(index)) {
    expandedLinks.value.delete(index)
    // 清空連結
    creators.value[index].link = undefined
  } else {
    expandedLinks.value.add(index)
  }
}

// 添加創作者
const addCreator = () => {
  if (creators.value.length < 10) {
    creators.value.push({ name: '' })
  }
}

// 移除創作者
const removeCreator = (index: number) => {
  if (creators.value.length > 1) {
    creators.value.splice(index, 1)
    expandedLinks.value.delete(index)
    // 更新其他項的索引
    const newExpanded = new Set<number>()
    expandedLinks.value.forEach(i => {
      if (i > index) {
        newExpanded.add(i - 1)
      } else if (i < index) {
        newExpanded.add(i)
      }
    })
    expandedLinks.value = newExpanded
  } else {
    // 如果只剩一個，清空它
    creators.value[0] = { name: '' }
    expandedLinks.value.delete(0)
  }
}

// 清理 timeout
onUnmounted(() => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
})
</script>
