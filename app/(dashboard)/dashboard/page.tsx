import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AFRICAN_STYLES } from '@/lib/styles'
import { PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { count: totalGenerations },
    { count: totalMedia },
    { count: totalFavorites },
    { data: profile },
    { data: recentMedia },
    { data: styleStats },
  ] = await Promise.all([
    supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_favorite', true),
    supabase.from('profiles').select('plan, credits').eq('id', user.id).single(),
    supabase.from('media').select('url, style, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
    supabase.from('generations').select('style').eq('user_id', user.id).eq('status', 'completed'),
  ])

  const plan = (profile?.plan ?? 'free') as PlanId
  const credits = profile?.credits ?? 0
  const isUnlimited = plan === 'studio'

  // Compute most-used style
  const styleCounts: Record<string, number> = {}
  for (const g of styleStats ?? []) {
    styleCounts[g.style] = (styleCounts[g.style] ?? 0) + 1
  }
  const topStyleId = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const topStyle = AFRICAN_STYLES.find((s) => s.id === topStyleId)

  const creditsMax = isUnlimited ? null : PLANS[plan].credits_per_month
  const creditsUsedPercent = creditsMax
    ? Math.round(((creditsMax - credits) / creditsMax) * 100)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-griot-text-muted mt-1 text-sm">
            Bienvenue. Prêt à créer quelque chose de beau ?
          </p>
        </div>
        <Link
          href="/generate"
          className={cn(buttonVariants(), 'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-semibold')}
        >
          ✦ Générer
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Générations" value={totalGenerations ?? 0} icon="◈" />
        <StatCard label="Médias" value={totalMedia ?? 0} icon="▦" />
        <StatCard label="Favoris" value={totalFavorites ?? 0} icon="★" />
        <StatCard
          label="Crédits"
          value={isUnlimited ? '∞' : credits}
          icon="✦"
          accent
        />
      </div>

      {/* Credits usage bar */}
      {!isUnlimited && creditsMax && (
        <div className="bg-griot-surface border border-white/5 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-griot-text-muted">Crédits utilisés ce mois</span>
            <span className="font-medium">
              <span className="text-griot-gold">{creditsMax - credits}</span>
              <span className="text-griot-text-muted"> / {creditsMax}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-griot-gold transition-all"
              style={{ width: `${Math.min(creditsUsedPercent, 100)}%` }}
            />
          </div>
          {credits <= 2 && (
            <p className="mt-2 text-xs text-amber-400">
              ⚠ Crédits presque épuisés.{' '}
              <Link href="/pricing" className="underline hover:text-amber-300">Passer Premium</Link>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent creations */}
        <div className="bg-griot-surface border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-griot-text-muted">
              Créations récentes
            </h2>
            <Link href="/gallery" className="text-xs text-griot-gold hover:underline">Voir tout →</Link>
          </div>
          {(recentMedia ?? []).length === 0 ? (
            <div className="text-center py-8 text-griot-text-muted text-sm">
              <div className="text-3xl mb-2">🎨</div>
              Aucune création pour l&apos;instant.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(recentMedia ?? []).map((m) => (
                <div key={m.url} className="aspect-square rounded-lg overflow-hidden bg-griot-bg border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-griot-surface border border-white/5 rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-griot-text-muted">
            Insights
          </h2>

          {topStyle ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-griot-bg border border-white/5">
              <span className="text-2xl">{topStyle.emoji}</span>
              <div>
                <div className="text-xs text-griot-text-muted">Style préféré</div>
                <div className="text-sm font-medium">{topStyle.name}</div>
              </div>
              <div className="ml-auto text-griot-gold font-heading font-bold text-lg">
                {styleCounts[topStyleId!]}×
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-griot-bg border border-white/5 text-sm text-griot-text-muted">
              Lance ta première génération pour voir tes stats.
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-lg bg-griot-bg border border-white/5">
            <span className="text-xl">📅</span>
            <div>
              <div className="text-xs text-griot-text-muted">Plan actuel</div>
              <div className="text-sm font-medium capitalize">{plan}</div>
            </div>
            {plan === 'free' && (
              <Link
                href="/pricing"
                className="ml-auto text-xs text-griot-gold hover:underline shrink-0"
              >
                Passer Premium →
              </Link>
            )}
          </div>

          {(totalGenerations ?? 0) > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-griot-bg border border-white/5">
              <span className="text-xl">⚡</span>
              <div>
                <div className="text-xs text-griot-text-muted">Médias / génération</div>
                <div className="text-sm font-medium">
                  {((totalMedia ?? 0) / (totalGenerations ?? 1)).toFixed(1)} en moyenne
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: number | string
  icon: string
  accent?: boolean
}) {
  return (
    <div className={cn(
      'rounded-xl p-5 border',
      accent ? 'bg-griot-gold/5 border-griot-gold/20' : 'bg-griot-surface border-white/5',
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-griot-text-muted">{label}</span>
        <span className={cn('text-sm', accent ? 'text-griot-gold' : 'text-griot-text-muted')}>{icon}</span>
      </div>
      <div className={cn('font-heading text-3xl font-bold', accent && 'text-griot-gold')}>
        {value}
      </div>
    </div>
  )
}
