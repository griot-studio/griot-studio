import { cn } from '@/lib/utils'
import { PLANS, type PlanId } from '@/lib/credits'

interface PlanBadgeProps {
  plan: PlanId
  className?: string
}

const PLAN_STYLES: Record<PlanId, string> = {
  free: 'bg-white/5 text-griot-text-muted border-white/10',
  creator: 'bg-griot-gold/10 text-griot-gold border-griot-gold/30',
  studio: 'bg-griot-gold/20 text-griot-gold border-griot-gold/50',
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium uppercase tracking-wider',
        PLAN_STYLES[plan],
        className,
      )}
    >
      {PLANS[plan].name}
    </span>
  )
}
