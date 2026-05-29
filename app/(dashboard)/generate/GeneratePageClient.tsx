'use client'

import { useGenerateStore } from '@/stores/generateStore'
import { useGenerate } from '@/hooks/useGenerate'
import { StylePicker } from '@/components/generate/StylePicker'
import { PromptInput } from '@/components/generate/PromptInput'
import { GenerateButton } from '@/components/generate/GenerateButton'
import { ResultsGrid } from '@/components/generate/ResultsGrid'
import { cn } from '@/lib/utils'
import type { StyleId } from '@/lib/styles'
import type { MediaType } from '@/types'

interface GeneratePageClientProps {
  credits: number
  plan: string
}

export function GeneratePageClient({ credits, plan }: GeneratePageClientProps) {
  const { prompt, styleId, type, isGenerating, results, error, setPrompt, setStyle, setType, generate } =
    useGenerate()

  const promptEn = useGenerateStore((s) => s.promptEn)

  const canGenerate = prompt.trim().length >= 3 && styleId !== null

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Générer
        </h1>
        <p className="text-griot-text-muted mt-1 text-sm">
          Décris ta scène en français, choisis un style africain — Griot optimise et génère.
        </p>
      </div>

      <div className="space-y-8">
        {/* Image / Video toggle */}
        <div>
          <label className="block text-sm font-medium text-griot-text-muted mb-3">
            Type de génération
          </label>
          <div className="inline-flex rounded-lg border border-white/10 p-1 bg-griot-surface">
            {(['image', 'video'] as MediaType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                disabled={isGenerating}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition',
                  type === t
                    ? 'bg-griot-gold text-griot-bg'
                    : 'text-griot-text-muted hover:text-griot-text',
                )}
              >
                {t === 'image' ? '🖼 Image' : '🎬 Vidéo'}
              </button>
            ))}
          </div>
          {type === 'video' && (
            <p className="mt-2 text-xs text-griot-text-muted">
              Vidéo 5s · 5 crédits · Propulsé par Kling AI
            </p>
          )}
        </div>

        {/* Style picker */}
        <StylePicker
          value={styleId}
          onChange={(id) => setStyle(id as StyleId)}
        />

        {/* Prompt input */}
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          disabled={isGenerating}
        />

        {/* Generate button */}
        <GenerateButton
          onClick={generate}
          isGenerating={isGenerating}
          disabled={!canGenerate}
          credits={credits}
        />

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error === 'Crédits insuffisants' ? (
              <>
                ✦ Crédits insuffisants.{' '}
                <a href="/settings" className="underline hover:text-red-300">
                  Passer à un plan supérieur
                </a>
              </>
            ) : (
              error
            )}
          </div>
        )}

        {/* Results */}
        <ResultsGrid
          urls={results}
          isLoading={isGenerating}
          promptEn={promptEn ?? undefined}
          watermark={plan === 'free'}
        />
      </div>

      {plan === 'free' && (
        <p className="mt-12 text-xs text-griot-text-muted text-center">
          Plan Gratuit · {credits} crédit{credits > 1 ? 's' : ''} restant{credits > 1 ? 's' : ''} ·{' '}
          <a href="/settings" className="text-griot-gold hover:underline">
            Passer Créateur (29€/mois)
          </a>
        </p>
      )}
    </div>
  )
}
