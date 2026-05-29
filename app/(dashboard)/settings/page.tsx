import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'
import type { PlanId } from '@/lib/credits'
import type { CreditTransaction } from '@/types'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { checkout?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }, { data: transactions }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, username, plan, credits, stripe_id, avatar_url')
        .eq('id', user.id)
        .single(),
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle(),
      supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  return (
    <SettingsClient
      user={{ email: user.email ?? '', id: user.id }}
      profile={{
        full_name: profile?.full_name ?? null,
        username: profile?.username ?? null,
        plan: (profile?.plan ?? 'free') as PlanId,
        credits: profile?.credits ?? 0,
        stripe_id: profile?.stripe_id ?? null,
        avatar_url: profile?.avatar_url ?? null,
      }}
      subscription={subscription ?? null}
      transactions={(transactions ?? []) as CreditTransaction[]}
      checkoutStatus={searchParams.checkout}
    />
  )
}
