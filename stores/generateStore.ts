import { create } from 'zustand'
import type { StyleId } from '@/lib/styles'
import type { MediaType } from '@/types'

interface GenerateState {
  prompt: string
  styleId: StyleId | null
  type: MediaType
  isGenerating: boolean
  results: string[]
  promptEn: string | null
  error: string | null
  setPrompt: (p: string) => void
  setStyle: (s: StyleId | null) => void
  setType: (t: MediaType) => void
  setGenerating: (b: boolean) => void
  setResults: (r: string[]) => void
  setPromptEn: (p: string | null) => void
  setError: (e: string | null) => void
  reset: () => void
}

export const useGenerateStore = create<GenerateState>((set) => ({
  prompt: '',
  styleId: null,
  type: 'image',
  isGenerating: false,
  results: [],
  promptEn: null,
  error: null,
  setPrompt: (prompt) => set({ prompt }),
  setStyle: (styleId) => set({ styleId }),
  setType: (type) => set({ type }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setResults: (results) => set({ results }),
  setPromptEn: (promptEn) => set({ promptEn }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      prompt: '',
      styleId: null,
      results: [],
      promptEn: null,
      isGenerating: false,
      error: null,
    }),
}))
