'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { Media } from '@/types'

interface GalleryClientProps {
  initialMedia: Media[]
}

type Filter = 'all' | 'image' | 'video' | 'favorite'

export function GalleryClient({ initialMedia }: GalleryClientProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [downloading, setDownloading] = useState<string | null>(null)

  const filtered = initialMedia.filter((m) => {
    if (filter === 'all') return true
    if (filter === 'favorite') return m.is_favorite
    return m.type === filter
  })

  const handleDownload = async (url: string, id: string) => {
    setDownloading(id)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `griot-studio-${id}.webp`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setDownloading(null)
    }
  }

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Tout' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Vidéos' },
    { id: 'favorite', label: '★ Favoris' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Galerie</h1>
          <p className="text-griot-text-muted text-sm mt-1">
            {initialMedia.length} média{initialMedia.length > 1 ? 's' : ''} généré{initialMedia.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/generate"
          className={cn(
            buttonVariants(),
            'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-medium',
          )}
        >
          ✦ Générer
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm transition border',
              filter === f.id
                ? 'bg-griot-gold/10 border-griot-gold/40 text-griot-gold'
                : 'bg-griot-surface border-white/5 text-griot-text-muted hover:text-griot-text hover:border-white/15',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-griot-text-muted">
          <div className="text-5xl mb-4">🎨</div>
          <p className="text-lg font-medium mb-2">Aucun média ici</p>
          <p className="text-sm mb-6">
            {filter === 'favorite'
              ? 'Aucun favori pour l\'instant.'
              : 'Lance ta première génération pour voir tes créations ici.'}
          </p>
          <Link
            href="/generate"
            className={cn(
              buttonVariants(),
              'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-medium',
            )}
          >
            ✦ Générer
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((media) => (
            <div
              key={media.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-griot-surface border border-white/5"
            >
              {media.type === 'image' ? (
                <Image
                  src={media.url}
                  alt={media.prompt ?? 'Image générée'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDownload(media.url, media.id)}
                  disabled={downloading === media.id}
                  className="bg-griot-gold text-griot-bg text-xs font-medium px-3 py-1.5 rounded-full hover:bg-griot-gold-soft transition"
                >
                  {downloading === media.id ? '…' : '↓ Télécharger'}
                </button>
              </div>

              {/* Style badge */}
              {media.style && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-griot-gold text-[10px] px-1.5 py-0.5 rounded-md">
                  {media.style}
                </div>
              )}

              {/* Favorite indicator */}
              {media.is_favorite && (
                <div className="absolute top-2 right-2 text-griot-gold text-sm">★</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
