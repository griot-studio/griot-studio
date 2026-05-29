'use client'

import { Textarea } from '@/components/ui/textarea'

interface PromptInputProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

const EXAMPLES = [
  'Un griot sous un baobab racontant des histoires à des enfants',
  'Une femme en grand boubou doré marchant dans les rues de Dakar',
  'Un musicien jouant du kora au coucher du soleil sur la savane',
]

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-griot-text-muted mb-3">
        Décris ta scène <span className="text-griot-gold">en français</span>
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Ex : Un roi africain en habits royaux, entouré de conseillers, dans un palais aux murs ornés de fresques…"
        rows={4}
        className="bg-griot-bg border-white/10 focus:border-griot-gold/50 resize-none text-griot-text placeholder:text-griot-text-muted/50"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onChange(ex)}
            disabled={disabled}
            className="text-xs text-griot-text-muted hover:text-griot-gold bg-griot-surface border border-white/5 hover:border-griot-gold/20 px-2 py-1 rounded-md transition disabled:opacity-40"
          >
            {ex.slice(0, 40)}…
          </button>
        ))}
      </div>
    </div>
  )
}
