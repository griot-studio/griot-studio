import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-griot-bg text-griot-text flex flex-col">
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight">
            Griot<span className="text-griot-gold">.</span>Studio
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-sm text-griot-text-muted hover:text-griot-text transition"
            >
              Tarifs
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
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-griot-text-muted">
        © {new Date().getFullYear()} Griot Studio
      </footer>
    </div>
  )
}
