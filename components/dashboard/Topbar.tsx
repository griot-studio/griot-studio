'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CreditsBadge } from '@/components/shared/CreditsBadge'
import { PlanBadge } from '@/components/shared/PlanBadge'
import { Button } from '@/components/ui/button'
import type { PlanId } from '@/lib/plans'

interface TopbarProps {
  email: string
  plan: PlanId
  credits: number
}

export function Topbar({ email, plan, credits }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-white/5 bg-griot-bg/80 backdrop-blur">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlanBadge plan={plan} />
        </div>
        <div className="flex items-center gap-4">
          <CreditsBadge
            credits={credits}
            unlimited={plan === 'studio'}
          />
          <div className="hidden sm:block text-sm text-griot-text-muted">
            {email}
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-griot-text-muted hover:text-griot-text"
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  )
}
