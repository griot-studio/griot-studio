// ── SERVER-ONLY ───────────────────────────────────────────────
// This file imports next/headers via createClient — do NOT import
// it from client components. Use lib/plans.ts for constants.

import { createClient } from '@/lib/supabase/server'

// Re-export constants for server-only files that import from here
export { PLANS, CREDIT_COSTS } from '@/lib/plans'
export type { PlanId, CreditCostKey } from '@/lib/plans'

/**
 * Check whether the authenticated user has enough credits.
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
 */
export async function debitCredits(
  userId: string,
  amount: number,
  description: string,
  reference?: string,
): Promise<void> {
  const supabase = await createClient()

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
