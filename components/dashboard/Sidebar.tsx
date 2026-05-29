'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Accueil', icon: '◐' },
  { href: '/generate', label: 'Générer', icon: '✦' },
  { href: '/gallery', label: 'Galerie', icon: '▦' },
  { href: '/settings', label: 'Réglages', icon: '⚙' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-white/5 bg-[var(--sidebar)]">
      <div className="px-6 py-5 border-b border-white/5">
        <Link
          href="/dashboard"
          className="font-heading text-lg font-bold tracking-tight"
        >
          Griot<span className="text-griot-gold">.</span>Studio
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition',
                active
                  ? 'bg-white/5 text-griot-gold'
                  : 'text-griot-text-muted hover:text-griot-text hover:bg-white/5',
              )}
            >
              <span className="text-base w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <Link
          href="/settings"
          className="block px-3 py-2 rounded-md text-xs text-griot-text-muted hover:text-griot-text hover:bg-white/5"
        >
          Aide & support
        </Link>
      </div>
    </aside>
  )
}
