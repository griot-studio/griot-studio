'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { type PlanId } from '@/lib/credits'
import { PlanBadge } from '@/components/shared/PlanBadge'
import { CreditsBadge } from '@/components/shared/CreditsBadge'
import type { CreditTransaction } from '@/types'

interface Props {
  user: { email: string; id: string }
  profile: {
    full_name: string | null
    username: string | null
    plan: PlanId
    credits: number
    stripe_id: string | null
    avatar_url: string | null
  }
  subscription: {
    plan: string
    status: string
    current_period_end: string | null
    cancel_at: string | null
  } | null
  transactions: CreditTransaction[]
  checkoutStatus?: string
}

export function SettingsClient({
  user,
  profile,
  subscription,
  transactions,
  checkoutStatus,
}: Props) {
  const [portalLoading, setPortalLoading] = useState(false)

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) { alert(error); return }
      window.location.href = url
    } finally {
      setPortalLoading(false)
    }
  }

  const isUnlimited = profile.plan === 'studio'

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Réglages</h1>
        <p className="text-griot-text-muted mt-1 text-sm">Compte, plan et facturation</p>
      </div>

      {/* Checkout success banner */}
      {checkoutStatus === 'success' && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          ✓ Abonnement activé avec succès ! Tes crédits ont été mis à jour.
        </div>
      )}

      {/* Account info */}
      <section className="bg-griot-surface border border-white/5 rounded-xl p-6">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-griot-text-muted mb-4">
          Compte
        </h2>
        <div className="space-y-3">
          <Row label="Email" value={user.email} />
          <Row label="Nom" value={profile.full_name ?? '—'} />
          <Row label="Identifiant" value={profile.username ?? '—'} />
        </div>
      </section>

      {/* Plan & credits */}
      <section className="bg-griot-surface border border-white/5 rounded-xl p-6">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-griot-text-muted mb-4">
          Plan actuel
        </h2>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <PlanBadge plan={profile.plan} />
              <CreditsBadge credits={profile.credits} unlimited={isUnlimited} />
            </div>
            {subscription && (
              <p className="text-xs text-griot-text-muted">
                {subscription.cancel_at ? (
                  <>
                    Annulation prévue le{' '}
                    <span className="text-red-400">
                      {new Date(subscription.cancel_at).toLocaleDateString('fr-FR')}
                    </span>
                  </>
                ) : subscription.current_period_end ? (
                  <>
                    Prochain renouvellement :{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                  </>
                ) : null}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {profile.plan === 'free' ? (
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants(),
                  'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-medium',
                )}
              >
                ✦ Passer Premium
              </Link>
            ) : profile.stripe_id ? (
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'border-white/10 hover:bg-white/5',
                  portalLoading && 'opacity-60 cursor-not-allowed',
                )}
              >
                {portalLoading ? '…' : 'Gérer l\'abonnement'}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Credit history */}
      {transactions.length > 0 && (
        <section className="bg-griot-surface border border-white/5 rounded-xl p-6">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-griot-text-muted mb-4">
            Historique crédits
          </h2>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <span className="text-griot-text-muted">
                  {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                  {' · '}
                  {tx.description ?? tx.type}
                </span>
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    tx.amount > 0 ? 'text-green-400' : 'text-griot-text-muted',
                  )}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Danger zone */}
      <section className="bg-griot-surface border border-red-500/10 rounded-xl p-6">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-red-400/70 mb-4">
          Zone danger
        </h2>
        <p className="text-sm text-griot-text-muted mb-4">
          La suppression de ton compte est définitive et efface toutes tes données.
        </p>
        <button
          disabled
          className="text-xs text-red-400/50 border border-red-500/10 rounded-md px-3 py-1.5 cursor-not-allowed"
        >
          Supprimer mon compte (bientôt disponible)
        </button>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-xs text-griot-text-muted shrink-0">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
