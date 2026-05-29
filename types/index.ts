import type { StyleId } from '@/lib/styles'
import type { PlanId } from '@/lib/credits'

export type MediaType = 'image' | 'video'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type TransactionType = 'grant' | 'debit' | 'refund' | 'purchase'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  plan: PlanId
  credits: number
  stripe_id: string | null
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  prompt_fr: string
  prompt_en: string
  style: StyleId | string
  type: MediaType
  status: GenerationStatus
  credits_used: number
  fal_request_id: string | null
  results: unknown[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Media {
  id: string
  user_id: string
  generation_id: string | null
  url: string
  r2_key: string
  type: MediaType
  style: string | null
  prompt: string | null
  is_favorite: boolean
  width: number | null
  height: number | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_sub_id: string
  stripe_price_id: string
  plan: PlanId
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at: string | null
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  description: string | null
  reference: string | null
  created_at: string
}
