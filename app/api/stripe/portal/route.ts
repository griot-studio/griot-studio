import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export async function POST() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_id) {
    return NextResponse.json(
      { error: 'Aucun compte Stripe associé' },
      { status: 404 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const url = await createPortalSession(profile.stripe_id, `${appUrl}/settings`)

  return NextResponse.json({ url })
}
