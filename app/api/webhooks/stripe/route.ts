import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { getStripe, getPlanFromPriceId, getCreditsForPlan } from '@/lib/stripe'
import { sendSubscriptionConfirmEmail, sendCancellationEmail } from '@/lib/resend'
import { createClient } from '@supabase/supabase-js'

// Use service-role client — webhooks are server-side and need to bypass RLS
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature failed'
    console.error('[stripe/webhook] signature error:', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const supabase = adminClient()

  try {
    switch (event.type) {
      // ── New subscription / first payment ──────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.supabase_user_id
        if (!userId) break

        const subscriptionId = session.subscription as string
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price?.id
        const plan = getPlanFromPriceId(priceId) ?? 'creator'
        const credits = getCreditsForPlan(plan)
        const customerId = session.customer as string

        // Update profile
        await supabase
          .from('profiles')
          .update({ plan, credits, stripe_id: customerId })
          .eq('id', userId)

        // Upsert subscription record
        const item = subscription.items.data[0]
        const periodStart = item?.billing_thresholds
          ? null
          : new Date(subscription.billing_cycle_anchor * 1000).toISOString()
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_sub_id: subscriptionId,
          stripe_price_id: priceId,
          plan,
          status: subscription.status,
          current_period_start: periodStart,
          current_period_end: null, // retrieved from invoice events
        }, { onConflict: 'stripe_sub_id' })

        // Credit transaction log
        await supabase.from('credit_transactions').insert({
          user_id: userId,
          amount: credits,
          type: 'grant',
          description: `Activation plan ${plan}`,
          reference: subscriptionId,
        })

        // Email
        const { data: user } = await supabase.auth.admin.getUserById(userId)
        if (user?.user?.email) {
          await sendSubscriptionConfirmEmail(user.user.email, plan, credits)
        }
        break
      }

      // ── Subscription renewed / updated ────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        const priceId = sub.items.data[0]?.price?.id
        const plan = getPlanFromPriceId(priceId)
        const cancelAt = sub.cancel_at
          ? new Date(sub.cancel_at * 1000).toISOString()
          : null

        // Update subscription row
        await supabase
          .from('subscriptions')
          .update({
            stripe_price_id: priceId,
            plan: plan ?? 'free',
            status: sub.status,
            current_period_start: new Date(sub.billing_cycle_anchor * 1000).toISOString(),
            cancel_at: cancelAt,
          })
          .eq('stripe_sub_id', sub.id)

        // If subscription is active and renewed → refresh credits
        if (sub.status === 'active' && plan) {
          const previousAttributes = event.data.previous_attributes as Record<string, unknown>
          const periodRenewed =
            previousAttributes?.billing_cycle_anchor !== undefined

          if (periodRenewed) {
            const credits = getCreditsForPlan(plan)
            await supabase
              .from('profiles')
              .update({ credits })
              .eq('id', userId)

            await supabase.from('credit_transactions').insert({
              user_id: userId,
              amount: credits,
              type: 'grant',
              description: `Renouvellement mensuel plan ${plan}`,
              reference: sub.id,
            })
          }
        }

        // Cancellation scheduled — send email
        if (cancelAt) {
          const { data: user } = await supabase.auth.admin.getUserById(userId)
          if (user?.user?.email) {
            await sendCancellationEmail(
              user.user.email,
              new Date(cancelAt).toLocaleDateString('fr-FR'),
            )
          }
        }
        break
      }

      // ── Subscription cancelled / expired ──────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        // Downgrade to free
        await supabase
          .from('profiles')
          .update({ plan: 'free', credits: 5 })
          .eq('id', userId)

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_sub_id', sub.id)

        await supabase.from('credit_transactions').insert({
          user_id: userId,
          amount: 5,
          type: 'grant',
          description: 'Retour plan gratuit',
          reference: sub.id,
        })
        break
      }

      default:
        // Ignore unhandled events
        break
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Handler error'
    console.error('[stripe/webhook] handler error:', event.type, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
