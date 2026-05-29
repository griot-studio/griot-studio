import Stripe from 'stripe'
import { PLANS, type PlanId } from './credits'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-05-27.dahlia' as any,
  typescript: true,
})

/**
 * Create or retrieve a Stripe customer for the given user.
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  existingStripeId?: string | null,
): Promise<string> {
  if (existingStripeId) return existingStripeId

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })

  return customer.id
}

/**
 * Create a Stripe Checkout Session for a subscription.
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  userId: string
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { supabase_user_id: userId },
    subscription_data: {
      metadata: { supabase_user_id: userId },
    },
    allow_promotion_codes: true,
  })

  return session.url!
}

/**
 * Create a Stripe Billing Portal session.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

/**
 * Determine the PlanId from a Stripe price ID.
 */
export function getPlanFromPriceId(priceId: string): PlanId | null {
  if (priceId === process.env.STRIPE_PRICE_CREATOR) return 'creator'
  if (priceId === process.env.STRIPE_PRICE_STUDIO) return 'studio'
  return null
}

/**
 * Credits to grant when a plan activates/renews.
 */
export function getCreditsForPlan(plan: PlanId): number {
  return PLANS[plan].credits_per_month === -1
    ? 999999   // "unlimited" represented as a large number
    : PLANS[plan].credits_per_month
}
