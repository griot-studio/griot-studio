'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ResultsGridProps {
  urls: string[]
  isLoading: boolean
  promptEn?: string
}

export function ResultsGrid({ urls, isLoading, promptEn }: ResultsGridProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (url: string, index: number) => {
    setDownloading(url)
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `griot-studio-${Date.now()}-${index + 1}.webp`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      console.error('Download failed', e)
    } finally {
      setDownloading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4 text-sm text-griot-text-muted">
          <span className="animate-spin inline-block w-3 h-3 border-2 border-griot-gold/30 border-t-griot-gold rounded-full" />
          <span>Optimisation du prompt · Génération en cours…</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-griot-surface border border-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (urls.length === 0) return null

  return (
    <div className="mt-8">
      {promptEn && (
        <div className="mb-4 p-3 bg-griot-surface border border-white/5 rounded-lg">
          <p className="text-xs text-griot-text-muted">
            <span className="text-griot-gold font-medium">Prompt optimisé :</span>{' '}
            {promptEn}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {urls.map((url, i) => (
          <div key={url} className="group relative aspect-square rounded-xl overflow-hidden bg-griot-surface border border-white/5">
            <Image
              src={url}
              alt={`Génération ${i + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => handleDownload(url, i)}
                disabled={downloading === url}
                className="bg-griot-gold text-griot-bg text-xs font-medium px-3 py-1.5 rounded-full hover:bg-griot-gold-soft transition"
              >
                {downloading === url ? '…' : '↓ Télécharger'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
