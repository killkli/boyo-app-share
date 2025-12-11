import { useLocalStorage } from '@vueuse/core'
import { ref, computed, watch } from 'vue'

/**
 * Manages Client-Side AI Settings (API Key, Model Preference)
 * Data is persisted in localStorage.
 */
export const useAISettings = () => {
    // API Key stored in browser local storage
    const apiKey = useLocalStorage<string>('boyo-ai-key', '')

    // Model selection
    const model = useLocalStorage<string>('boyo-ai-model', 'gemini-flash-latest')

    // Available models - Dynamic
    const availableModels = ref<{ value: string; label: string }[]>([
        // Default fallback
        { value: 'gemini-flash-latest', label: 'Gemini Flash (Latest)' },
        { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
        { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Preview)' },
    ])

    // Computed state to check if ready
    const isConfigured = computed(() => !!apiKey.value && apiKey.value.length > 10)

    // We need to import useAI here, but useAI uses useAISettings, causing circular dependency
    // So we will trigger model fetch from the component level or separate the logic.
    // Ideally, passing listModels into a function here or just exporting the state.

    return {
        apiKey,
        model,
        availableModels,
        isConfigured
    }
}
