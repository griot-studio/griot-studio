import { cn } from '@/lib/utils'

interface CreditsBadgeProps {
  credits: number
  unlimited?: boolean
  className?: string
}

export function CreditsBadge({
  credits,
  unlimited,
  className,
}: CreditsBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-griot-surface border border-griot-gold/20 text-sm',
        className,
      )}
    >
      <span className="text-griot-gold">✦</span>
      <span className="font-medium">
        {unlimited ? '∞' : credits}
      </span>
      <span className="text-griot-text-muted text-xs">crédits</span>
    </div>
  )
}
