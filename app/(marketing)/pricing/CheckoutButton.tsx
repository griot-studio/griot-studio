'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { PlanId } from '@/lib/plans'

interface CheckoutButtonProps {
  plan: PlanId
  label: string
  highlight?: boolean
}

export function CheckoutButton({ plan, label, highlight }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (res.status === 401) {
        window.location.href = `/login?next=/pricing`
        return
      }

      const { url, error } = await res.json()
      if (error) {
        alert(error)
        return
      }
      window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        buttonVariants({ size: 'lg' }),
        highlight
          ? 'bg-griot-gold text-griot-bg hover:bg-griot-gold-soft font-semibold'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 font-medium',
        'w-full justify-center',
        loading && 'opacity-60 cursor-not-allowed',
      )}
    >
      {loading ? '…' : label}
    </button>
  )
}
