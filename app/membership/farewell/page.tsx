'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function FarewellPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tierLabel, setTierLabel] = useState('')
  const [endDateLabel, setEndDateLabel] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [done, setDone] = useState(false)
  const [alreadyCanceled, setAlreadyCanceled] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, stripe_customer_id')
        .eq('email', user.email.trim().toLowerCase())
        .maybeSingle()

      const status = (profile?.subscription_status || '').toLowerCase()
      if (status !== 'house_brew' && status !== 'private_reserve') {
        router.replace('/membership')
        return
      }

      setTierLabel(status === 'private_reserve' ? 'Private Reserve' : 'House Brew')

      try {
        const res = await fetch('/api/membership/period-end', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.endDate) {
            const d = new Date(data.endDate)
            setEndDateLabel(
              d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            )
          }
        }
      } catch {
        // silent
      }

      setLoading(false)
    }
    load()
  }, [router])

  const handleConfirmCancel = async () => {
    setCancelling(true)
    setError('')
    try {
      const res = await fetch('/api/membership/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to cancel right now')

      if (data.alreadyCanceling || data.alreadyFullyCanceled) {
        setAlreadyCanceled(true)
      }
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'Unable to cancel right now')
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F4EF]">
        <Header />
        <div className="max-w-xl mx-auto px-6 pt-16 text-[#6B5E54]">
          Opening the door…
        </div>
      </main>
    )
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#F7F4EF]">
        <Header />
        <div className="max-w-xl mx-auto px-6 pt-16 pb-24 text-center">
          {alreadyCanceled ? (
            <>
              <h1 className="text-2xl font-medium text-[#2C2522] mb-4">
                You have already cancelled
              </h1>
              <p className="text-[#6B5E54] text-[16px] leading-relaxed mb-8">
                Your membership is already set to end.
                {endDateLabel ? (
                  <>
                    {' '}
                    You have full access until <strong>{endDateLabel}</strong>, and then
                    your membership will be over.
                  </>
                ) : (
                  ' You have full access until the end of the current period, and then your membership will be over.'
                )}
                <br />
                <br />
                Sorry for any inconvenience. The door remains open if you ever wish to return.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-medium text-[#2C2522] mb-4">
                Your place is held
              </h1>
              <p className="text-[#6B5E54] text-[16px] leading-relaxed mb-8">
                Your membership will remain active until the end of the current period.
                After that the threshold stays open if you ever wish to return.
              </p>
            </>
          )}

          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-lg border border-[#C9BEB0] text-[#2C2522] text-[15px] hover:bg-[#F0EBE3] transition-colors"
          >
            Return to the house
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <div className="max-w-md mx-auto px-6 pt-8 pb-20">
        <div className="rounded-2xl overflow-hidden border border-[#E5DFD3] bg-white/60 mb-6">
          <div className="relative w-full aspect-[3/4] max-h-[340px]">
            <Image
              src="/images/reepicheep-farewell.jpg"
              alt="Reepicheep waving goodbye"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-medium text-[#2C2522] mb-3">
            A quiet goodbye
          </h1>
          <p className="text-[#6B5E54] text-[15px] leading-relaxed">
            You are about to cancel your reservation in the “{tierLabel}”.
            You will still have full access until the end of your current period.
            You can always come back as a visitor with your email or subscribe again.
          </p>
          {endDateLabel && (
            <p className="mt-3 text-[14px] text-[#8A7B65]">
              Your current subscription runs through <strong>{endDateLabel}</strong>.
            </p>
          )}
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-red-700">{error}</p>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            className="w-full py-3 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-[15px] hover:bg-[#3d342f] transition-colors disabled:opacity-50"
          >
            {cancelling
              ? 'Saying goodbye…'
              : 'We’ll cancel you for now. Hope to see you back soon.'}
          </button>

          <Link
            href="/"
            className="block w-full text-center py-3 rounded-lg border border-[#C9BEB0] text-[#6B5E54] text-[15px] hover:bg-[#F0EBE3] transition-colors"
          >
            I’ve changed my mind. I think I’ll stay awhile longer
          </Link>
        </div>
      </div>
    </main>
  )
}