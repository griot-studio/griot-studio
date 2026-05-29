import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'

const PLAN_DETAILS = [
  {
    key: 'free' as const,
    badge: null,
    cta: 'Commencer gratuitement',
    ctaHref: '/login',
    highlight: false,
  },
  {
    key: 'creator' as const,
    badge: 'Populaire',
    cta: 'Choisir Créateur',
    ctaHref: null, // triggers checkout
    highlight: true,
  },
  {
    key: 'studio' as const,
    badge: null,
    cta: 'Choisir Studio',
    ctaHref: null,
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-griot-gold mb-4">
          <span className="h-px w-8 bg-griot-gold/60" />
          Tarifs simples
          <span className="h-px w-8 bg-griot-gold/60" />
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Choisis ton plan
        </h1>
        <p className="text-griot-text-muted text-lg max-w-xl mx-auto">
          Commence gratuitement, passe au niveau supérieur quand tu es prêt.
          Annulation possible à tout moment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLAN_DETAILS.map(({ key, badge, cta, ctaHref, highlight }) => {
          const plan = PLANS[key]
          return (
            <div
              key={key}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6',
                highlight
                  ? 'border-griot-gold/50 bg-griot-gold/5'
                  : 'border-white/5 bg-griot-surface',
              )}
            >
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-griot-gold text-griot-bg text-xs font-semibold px-3 py-1 rounded-full">
                  {badge}
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-heading text-lg font-semibold mb-1">
                  {plan.name}
                </h2>
                <div className="flex items-end gap-1 mt-3">
                  <span className="font-heading text-4xl font-bold">
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-griot-text-muted text-sm mb-1">/mois</span>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-2.5 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <span className="text-griot-gold mt-0.5">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {ctaHref ? (
                <Link
                  href={ctaHref}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    highlight
                      ? 'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-semibold'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 font-medium',
                    'w-full justify-center',
                  )}
                >
                  {cta}
                </Link>
              ) : (
                <CheckoutButton plan={key} label={cta} highlight={highlight} />
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-griot-text-muted mt-12">
        Paiement sécurisé par Stripe · Sans engagement · Remboursement sous 7 jours
      </p>
    </div>
  )
}

// ── Client component for Stripe redirect ─────────────────────
import { CheckoutButton } from './CheckoutButton'
