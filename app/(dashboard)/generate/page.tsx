import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GeneratePageClient } from './GeneratePageClient'

export default async function GeneratePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits')
    .eq('id', user.id)
    .single()

  const credits = profile?.credits ?? 0
  const plan = profile?.plan ?? 'free'

  return <GeneratePageClient credits={credits} plan={plan} />
}
