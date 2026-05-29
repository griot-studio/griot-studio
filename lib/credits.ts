import { createClient } from '@/lib/supabase/server'

export const PLANS = {
  free: {
    name: 'Gratuit',
    price: 0,
    credits_per_month: 5,
    features: ['5 images/mois', '3 styles', 'Watermark'],
  },
  creator: {
    name: 'Créateur',
    price: 29,
    stripe_price_id: process.env.STRIPE_PRICE_CREATOR,
    credits_per_month: 100,
    features: ['100 images', '10 vidéos', 'Tous les styles', 'HD sans watermark'],
  },
  studio: {
    name: 'Studio',
    price: 79,
    stripe_price_id: process.env.STRIPE_PRICE_STUDIO,
    credits_per_month: -1,
    features: ['Illimité', 'API access', 'Support dédié'],
  },
} as const

export type PlanId = keyof typeof PLANS

export const CREDIT_COSTS = {
  image_standard: 1,  // 4 images 512×512
  image_hd: 2,        // 4 images 1024×1024
  video_short: 5,     // vidéo 5s
  video_long: 10,     // vidéo 10s
} as const

export type CreditCostKey = keyof typeof CREDIT_COSTS

/**
 * Check whether the authenticated user has enough credits.
 * Returns { ok: true, credits } or { ok: false, credits, required }.
 * Uses the service-role client to bypass RLS for the admin-side check.
 */
export async function checkCredits(
  userId: string,
  required: number,
): Promise<{ ok: boolean; credits: number; required: number }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('plan, credits')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return { ok: false, credits: 0, required }
  }

  // Studio plan = unlimited
  if (data.plan === 'studio') {
    return { ok: true, credits: Infinity, required }
  }

  return {
    ok: data.credits >= required,
    credits: data.credits,
    required,
  }
}

/**
 * Atomically debit credits and record the transaction.
 * Throws if the user doesn't have enough credits (race condition guard).
 */
export async function debitCredits(
  userId: string,
  amount: number,
  description: string,
  reference?: string,
): Promise<void> {
  const supabase = await createClient()

  // Decrement with a check — won't go below 0
  const { error: updateErr } = await supabase.rpc('debit_credits', {
    p_user_id: userId,
    p_amount: amount,
  })

  // If the RPC doesn't exist yet, fall back to a direct update
  if (updateErr?.code === 'PGRST202' || updateErr?.message?.includes('debit_credits')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, plan')
      .eq('id', userId)
      .single()

    if (!profile) throw new Error('Profile not found')
    if (profile.plan !== 'studio' && profile.credits < amount) {
      throw new Error('Insufficient credits')
    }

    if (profile.plan !== 'studio') {
      await supabase
        .from('profiles')
        .update({ credits: profile.credits - amount })
        .eq('id', userId)
    }
  } else if (updateErr) {
    throw new Error(`Credit debit failed: ${updateErr.message}`)
  }

  // Record transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: -amount,
    type: 'debit',
    description,
    reference,
  })
}

/**
 * Grant credits to a user (e.g. after subscription purchase).
 */
export async function grantCredits(
  userId: string,
  amount: number,
  description: string,
  reference?: string,
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('profiles')
    .update({ credits: amount })
    .eq('id', userId)

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount,
    type: 'grant',
    description,
    reference,
  })
}
