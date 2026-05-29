'use client'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { CREDIT_COSTS } from '@/lib/credits'

interface GenerateButtonProps {
  onClick: () => void
  isGenerating: boolean
  disabled: boolean
  credits: number
  quality?: 'standard' | 'hd'
}

export function GenerateButton({
  onClick,
  isGenerating,
  disabled,
  credits,
  quality = 'standard',
}: GenerateButtonProps) {
  const cost = quality === 'hd' ? CREDIT_COSTS.image_hd : CREDIT_COSTS.image_standard
  const canAfford = credits >= cost

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isGenerating || !canAfford}
        className={cn(
          buttonVariants({ size: 'lg' }),
          'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-semibold px-8 transition',
          (disabled || isGenerating || !canAfford) && 'opacity-50 cursor-not-allowed',
        )}
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-griot-bg/30 border-t-griot-bg rounded-full" />
            Génération en cours…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            ✦ Générer
          </span>
        )}
      </button>
      <span className="text-sm text-griot-text-muted">
        {canAfford ? (
          <>
            Coût : <span className="text-griot-gold font-medium">{cost} crédit{cost > 1 ? 's' : ''}</span>
            {' · '}solde : <span className="font-medium">{credits}</span>
          </>
        ) : (
          <span className="text-red-400">Crédits insuffisants ({credits}/{cost})</span>
        )}
      </span>
    </div>
  )
}
