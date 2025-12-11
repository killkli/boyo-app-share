import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Interface for AI generation options
 */
export interface GenerateOptions {
    systemPrompt?: string
}

/**
 * Main hook for interacting with the AI Provider
 */
export const useAI = () => {
    const { apiKey, model } = useAISettings()

    // Initialize client only when key exists
    const client = computed(() => {
        if (!apiKey.value) return null
        return new GoogleGenerativeAI(apiKey.value)
    })

    /**
     * Generates content using the configured model and key
     */
    const generate = async (prompt: string, options: GenerateOptions = {}) => {
        if (!client.value) {
            throw new Error('AI API Key is missing. Please configure it in settings.')
        }

        try {
            const genModel = client.value.getGenerativeModel({
                model: model.value,
                systemInstruction: options.systemPrompt
            })

            const result = await genModel.generateContent(prompt)
            const response = await result.response
            return {
                text: response.text(),
                usage: response.usageMetadata
            }
        } catch (error: any) {
            console.error('AI Generation Error:', error)
            // Enhance error message if possible
            if (error.message?.includes('API key')) {
                throw new Error('Invalid API Key provided.')
            }
            throw error
        }
    }

    /**
   * Fetches the list of available models from the API
   */
    const listModels = async (): Promise<{ name: string; displayName: string }[]> => {
        if (!apiKey.value) return []

        try {
            // Direct REST call as the JS SDK is primarily for generation
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.value}`)
            if (!response.ok) throw new Error('Failed to fetch models')

            const data = await response.json()
            return data.models
                .filter((m: any) => {
                    const name = m.name.toLowerCase()
                    const desc = (m.description || '').toLowerCase()
                    const version = (m.version || '').toLowerCase()

                    // Basic Requirement: Must support text generation
                    if (!m.supportedGenerationMethods?.includes('generateContent')) return false

                    // Must be a Gemini model (exclude PaLM/Gemma if user only wants Gemini, but keeping strictly Gemini for now as per previous context)
                    if (!name.includes('gemini')) return false

                    // EXCLUSIONS
                    const excludeTerms = [
                        'embedding',
                        'vision',
                        'image',
                        'tts',
                        'robotics',
                        'aqa',
                        'veo',
                        'imagen',
                        'deep-research' // Typically specialized
                    ]

                    if (excludeTerms.some(term => name.includes(term) || desc.includes(term))) return false

                    return true
                })
                .map((m: any) => ({
                    name: m.name.replace('models/', ''),
                    displayName: m.displayName
                }))
                .sort((a: any, b: any) => {
                    // Prioritize "latest" and "flash"
                    const scoreA = (a.name.includes('latest') ? 2 : 0) + (a.name.includes('flash') ? 1 : 0)
                    const scoreB = (b.name.includes('latest') ? 2 : 0) + (b.name.includes('flash') ? 1 : 0)
                    if (scoreA !== scoreB) return scoreB - scoreA
                    return b.displayName.localeCompare(a.displayName)
                })
        } catch (error) {
            console.error('Failed to list models:', error)
            return []
        }
    }

    return {
        generate,
        listModels
    }
}
