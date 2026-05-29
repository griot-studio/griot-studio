import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-griot-bg text-griot-text flex flex-col">
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight">
            Griot<span className="text-griot-gold">.</span>Studio
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-griot-text-muted hover:text-griot-text transition"
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants(),
                'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-medium',
              )}
            >
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-griot-gold mb-6">
            <span className="h-px w-8 bg-griot-gold/60" />
            Studio IA · pour créateurs africains
            <span className="h-px w-8 bg-griot-gold/60" />
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Donne vie à tes visions,{' '}
            <span className="text-griot-gold">en français</span>.
          </h1>
          <p className="mt-6 text-lg text-griot-text-muted max-w-2xl mx-auto">
            Le premier studio IA avec des presets culturels africains. Génère
            images et vidéos calibrées pour l&apos;esthétique du continent — du
            griot au boubou, du baobab à Lagos by night.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-medium px-6',
              )}
            >
              Créer mon compte
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'border-white/10 hover:bg-white/5 px-6',
              )}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-griot-text-muted">
        © {new Date().getFullYear()} Griot Studio
      </footer>
    </main>
  )
}
