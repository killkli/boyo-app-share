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
    <div v-if="creators.length > 0" class="space-y-2">
      <div
        v-for="(creator, index) in creators"
        :key="index"
        class="flex items-center gap-2 bg-muted border-2 border-foreground p-3"
      >
        <div class="flex-1 flex items-center gap-3">
          <span class="font-mono text-sm text-muted-foreground font-bold">{{ index + 1 }}.</span>
          <Input
            v-model="creators[index]"
            placeholder="創作者名稱"
            class="flex-1"
            maxlength="100"
            @input="handleCreatorChange(index, $event)"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="shrink-0 border-2"
          @click.prevent="removeCreator(index)"
          :disabled="creators.length === 1 && !creators[0]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
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
import { ref, watch, onUnmounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  modelValue: string[]
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  error: ''
})

const emit = defineEmits<Emits>()

// 本地創作者列表
const creators = ref<string[]>([...props.modelValue])

// 如果初始值為空，添加一個空項
if (creators.value.length === 0) {
  creators.value = ['']
}

// 監聽 props 變化（但避免無限循環）
watch(() => props.modelValue, (newValue) => {
  // 只有在外部值與內部值不同時才更新
  const currentFiltered = creators.value.map(c => c.trim()).filter(c => c.length > 0)
  const newFiltered = newValue.filter(c => c.trim().length > 0)

  // 比較兩個陣列是否相同
  const isDifferent = currentFiltered.length !== newFiltered.length ||
    currentFiltered.some((val, index) => val !== newFiltered[index])

  if (isDifferent) {
    creators.value = newValue.length > 0 ? [...newValue] : ['']
  }
}, { deep: true })

// 監聽本地變化，發送到父組件（使用 debounce 避免過度觸發）
let updateTimeout: NodeJS.Timeout | null = null
watch(creators, (newValue) => {
  // 清除之前的 timeout
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  // 延遲更新以避免無限循環
  updateTimeout = setTimeout(() => {
    // 過濾掉空白項目
    const filtered = newValue
      .map(c => c.trim())
      .filter(c => c.length > 0)

    emit('update:modelValue', filtered)
  }, 0)
}, { deep: true })

// 添加創作者
const addCreator = () => {
  if (creators.value.length < 10) {
    creators.value.push('')
  }
}

// 移除創作者
const removeCreator = (index: number) => {
  if (creators.value.length > 1) {
    creators.value.splice(index, 1)
  } else {
    // 如果只剩一個，清空它
    creators.value[0] = ''
  }
}

// 處理創作者變化
const handleCreatorChange = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  creators.value[index] = target.value
}

// 清理 timeout
onUnmounted(() => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
})
</script>
