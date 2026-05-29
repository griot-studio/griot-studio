import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  stripe,
  getOrCreateCustomer,
  createCheckoutSession,
} from '@/lib/stripe'
import { PLANS, type PlanId } from '@/lib/credits'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { plan } = await request.json() as { plan: PlanId }

  if (!plan || plan === 'free' || !PLANS[plan]) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const priceId = PLANS[plan].stripe_price_id
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID non configuré' }, { status: 500 })
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_id')
    .eq('id', user.id)
    .single()

  const customerId = await getOrCreateCustomer(
    user.id,
    user.email!,
    profile?.stripe_id,
  )

  // Persist stripe_id if new
  if (!profile?.stripe_id) {
    await supabase
      .from('profiles')
      .update({ stripe_id: customerId })
      .eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const url = await createCheckoutSession({
    customerId,
    priceId,
    userId: user.id,
    successUrl: `${appUrl}/settings?checkout=success`,
    cancelUrl: `${appUrl}/pricing?checkout=cancel`,
  })

  // Check for active subscription — redirect to portal instead
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_sub_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existingSub) {
    // User already has a subscription → update via portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings`,
    })
    return NextResponse.json({ url: portalSession.url })
  }

  return NextResponse.json({ url })
}
