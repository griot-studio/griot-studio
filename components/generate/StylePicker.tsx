'use client'

import { AFRICAN_STYLES, type StyleId } from '@/lib/styles'
import { cn } from '@/lib/utils'

interface StylePickerProps {
  value: StyleId | null
  onChange: (id: StyleId) => void
}

export function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-griot-text-muted mb-3">
        Style visuel
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {AFRICAN_STYLES.map((style) => {
          const active = value === style.id
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id as StyleId)}
              className={cn(
                'flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition',
                active
                  ? 'border-griot-gold bg-griot-gold/10 text-griot-text'
                  : 'border-white/5 bg-griot-surface hover:border-white/15 hover:bg-griot-surface-2 text-griot-text-muted hover:text-griot-text',
              )}
            >
              <span className="text-xl">{style.emoji}</span>
              <span className="text-xs font-medium leading-tight">{style.name}</span>
              <span className="text-[10px] leading-tight opacity-60">{style.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
