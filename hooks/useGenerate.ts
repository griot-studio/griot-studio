'use client'

import { useGenerateStore } from '@/stores/generateStore'
import type { StyleId } from '@/lib/styles'

export function useGenerate() {
  const store = useGenerateStore()

  const generate = async () => {
    if (!store.prompt || !store.styleId) return

    store.setGenerating(true)
    store.setResults([])
    store.setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: store.prompt,
          styleId: store.styleId,
          type: store.type,
          quality: 'standard',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        store.setError(data.error ?? 'Erreur inconnue')
        return
      }

      const urls: string[] = (data.media ?? []).map((m: { url: string }) => m.url)
      store.setResults(urls)

      // Store the optimized EN prompt for display
      if (data.promptEn) {
        useGenerateStore.setState({ promptEn: data.promptEn } as never)
      }
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      store.setGenerating(false)
    }
  }

  return {
    prompt: store.prompt,
    styleId: store.styleId,
    type: store.type,
    isGenerating: store.isGenerating,
    results: store.results,
    error: store.error,
    setPrompt: store.setPrompt,
    setStyle: (s: StyleId | null) => store.setStyle(s),
    setType: store.setType,
    generate,
    reset: store.reset,
  }
}
