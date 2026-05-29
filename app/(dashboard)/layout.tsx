import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import type { PlanId } from '@/lib/plans'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan ?? 'free') as PlanId
  const credits = profile?.credits ?? 0

  return (
    <div className="flex h-screen overflow-hidden bg-griot-bg text-griot-text">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar email={user.email ?? ''} plan={plan} credits={credits} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
