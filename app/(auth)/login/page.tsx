'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const supabase = createClient()
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    setErrorMsg(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  const handleGoogle = async () => {
    setStatus('sending')
    setErrorMsg(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${appUrl}/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-griot-bg text-griot-text flex flex-col items-center justify-center px-6">
      <Link
        href="/"
        className="font-heading text-2xl font-bold tracking-tight mb-12"
      >
        Griot<span className="text-griot-gold">.</span>Studio
      </Link>

      <div className="w-full max-w-md bg-griot-surface border border-white/5 rounded-xl p-8">
        <h1 className="font-heading text-2xl font-semibold mb-2">
          Bienvenue
        </h1>
        <p className="text-sm text-griot-text-muted mb-8">
          Connecte-toi pour commencer à générer.
        </p>

        <Button
          onClick={handleGoogle}
          disabled={status === 'sending'}
          variant="outline"
          className="w-full border-white/10 hover:bg-white/5 mb-6"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs uppercase tracking-wider text-griot-text-muted">
            ou
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {status === 'sent' ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">📬</div>
            <p className="text-sm text-griot-text">
              Lien magique envoyé à <strong>{email}</strong>.
            </p>
            <p className="text-xs text-griot-text-muted mt-2">
              Clique sur le lien dans l&apos;email pour te connecter.
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <Input
              type="email"
              required
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-griot-bg border-white/10"
              disabled={status === 'sending'}
            />
            <Button
              type="submit"
              disabled={status === 'sending' || !email}
              className="w-full bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-medium"
            >
              {status === 'sending' ? 'Envoi…' : 'Recevoir un lien magique'}
            </Button>
          </form>
        )}

        {errorMsg && (
          <p className="mt-4 text-sm text-red-400 text-center">{errorMsg}</p>
        )}
      </div>

      <p className="mt-8 text-xs text-griot-text-muted">
        Pas de compte ? Le lien magique le crée automatiquement.
      </p>
    </main>
  )
}
