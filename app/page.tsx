import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AFRICAN_STYLES } from '@/lib/styles'
import { PLANS } from '@/lib/plans'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-griot-bg text-griot-text flex flex-col">

      {/* ── NAV ───────────────────────────────────────────── */}
      <header className="border-b border-white/5 sticky top-0 z-50 bg-griot-bg/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight">
            Griot<span className="text-griot-gold">.</span>Studio
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-griot-text-muted hover:text-griot-text transition hidden sm:block">
              Tarifs
            </Link>
            <Link href="/login" className="text-sm text-griot-text-muted hover:text-griot-text transition">
              Connexion
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants(), 'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-medium')}
            >
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="flex items-center justify-center py-28 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-griot-gold/5 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-griot-gold mb-6">
            <span className="h-px w-8 bg-griot-gold/60" />
            Studio IA · pour créateurs africains
            <span className="h-px w-8 bg-griot-gold/60" />
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Donne vie à tes visions,{' '}
            <span className="text-griot-gold">en français</span>.
          </h1>
          <p className="text-lg text-griot-text-muted max-w-2xl mx-auto mb-10">
            Le premier studio IA avec des presets culturels africains. Génère images et vidéos
            calibrées pour l&apos;esthétique du continent — du griot au boubou, du baobab à Lagos by night.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: 'lg' }), 'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-semibold px-8')}
            >
              ✦ Commencer gratuitement
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'border-white/10 hover:bg-white/5 px-8')}
            >
              Voir les tarifs
            </Link>
          </div>
          <p className="mt-4 text-xs text-griot-text-muted">5 crédits offerts · Sans carte bancaire</p>
        </div>
      </section>

      {/* ── STYLES GRID ───────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              8 styles culturels africains
            </h2>
            <p className="text-griot-text-muted max-w-xl mx-auto">
              Chaque style est calibré avec des suffixes de prompt spécifiques
              pour des résultats authentiquement africains.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AFRICAN_STYLES.map((style) => (
              <div
                key={style.id}
                className="bg-griot-surface border border-white/5 rounded-xl p-4 hover:border-griot-gold/30 transition group"
              >
                <div className="text-3xl mb-3">{style.emoji}</div>
                <div className="font-heading font-semibold text-sm mb-1 group-hover:text-griot-gold transition">
                  {style.name}
                </div>
                <div className="text-xs text-griot-text-muted">{style.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              Comment ça marche
            </h2>
            <p className="text-griot-text-muted">Trois étapes, une image.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Décris en français',
                desc: 'Pas besoin d\'anglais ni de jargon technique. Écris ta scène comme tu la ressens.',
              },
              {
                step: '02',
                title: 'Choisis ton style',
                desc: 'Conte, Afrobeats, Portrait royal… 8 presets calibrés pour l\'esthétique africaine.',
              },
              {
                step: '03',
                title: 'L\'IA génère',
                desc: 'Claude optimise ton prompt, Flux Pro génère 4 variantes HD en quelques secondes.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="font-heading text-5xl font-bold text-griot-gold/20 mb-4">{step}</div>
                <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-griot-text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ───────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Tarifs simples</h2>
            <p className="text-griot-text-muted">Commence gratuitement, passe au niveau supérieur quand tu es prêt.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([
              { key: 'free', highlight: false, cta: 'Commencer' },
              { key: 'creator', highlight: true, cta: 'Choisir Créateur' },
              { key: 'studio', highlight: false, cta: 'Choisir Studio' },
            ] as const).map(({ key, highlight, cta }) => {
              const plan = PLANS[key]
              return (
                <div
                  key={key}
                  className={cn(
                    'rounded-2xl border p-6 flex flex-col',
                    highlight ? 'border-griot-gold/50 bg-griot-gold/5' : 'border-white/5 bg-griot-surface',
                  )}
                >
                  <div className="mb-4">
                    <div className="font-heading font-semibold">{plan.name}</div>
                    <div className="font-heading text-3xl font-bold mt-2">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                      {plan.price > 0 && <span className="text-sm font-normal text-griot-text-muted">/mois</span>}
                    </div>
                  </div>
                  <ul className="flex-1 space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm flex gap-2">
                        <span className="text-griot-gold shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants(),
                      'w-full justify-center',
                      highlight
                        ? 'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-semibold'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10',
                    )}
                  >
                    {cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Prêt à créer ?
          </h2>
          <p className="text-griot-text-muted mb-8">
            Rejoins les créateurs africains qui donnent vie à leurs visions.
          </p>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-semibold px-10')}
          >
            ✦ Créer mon compte — c&apos;est gratuit
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-griot-text-muted">
          <div className="font-heading font-bold text-sm">
            Griot<span className="text-griot-gold">.</span>Studio
          </div>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-griot-text transition">Tarifs</Link>
            <Link href="/login" className="hover:text-griot-text transition">Connexion</Link>
          </div>
          <div>© {new Date().getFullYear()} Griot Studio</div>
        </div>
      </footer>

    </main>
  )
}
