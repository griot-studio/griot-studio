import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count: generationsCount } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const { count: mediaCount } = await supabase
    .from('media')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Bonjour 👋
        </h1>
        <p className="text-griot-text-muted mt-1">
          Prêt à créer quelque chose de beau ?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="Générations" value={generationsCount ?? 0} />
        <StatCard label="Médias" value={mediaCount ?? 0} />
        <StatCard label="Favoris" value={0} />
      </div>

      <div className="bg-griot-surface border border-white/5 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">✦</div>
        <h2 className="font-heading text-xl font-semibold mb-2">
          Lance ta première génération
        </h2>
        <p className="text-griot-text-muted text-sm mb-6 max-w-md mx-auto">
          Choisis un style africain, décris ta scène en français, et laisse Griot
          faire le reste.
        </p>
        <Link
          href="/generate"
          className={cn(
            buttonVariants(),
            'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-medium',
          )}
        >
          Commencer à générer
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-griot-surface border border-white/5 rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-griot-text-muted">
        {label}
      </div>
      <div className="font-heading text-3xl font-bold mt-2">{value}</div>
    </div>
  )
}
