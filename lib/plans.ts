// ── PLANS & CREDIT COSTS ─────────────────────────────────────
// Safe to import from both client and server components.
// No server-only imports here.

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
