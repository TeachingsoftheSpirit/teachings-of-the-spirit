'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ManageMembershipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState<'house_brew' | 'private_reserve' | null>(null)
  const [intervalLabel, setIntervalLabel] = useState<string | null>(null)

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
        .select('subscription_status, billing_interval')
        .eq('email', user.email.trim().toLowerCase())
        .maybeSingle()

      const status = (profile?.subscription_status || '').toLowerCase()

      if (status !== 'house_brew' && status !== 'private_reserve') {
        router.replace('/membership')
        return
      }

      setTier(status as 'house_brew' | 'private_reserve')
      setIntervalLabel(
        profile?.billing_interval === 'annual'
          ? 'Annual'
          : profile?.billing_interval === 'monthly'
            ? 'Monthly'
            : null
      )
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F4EF]">
        <Header />
        <div className="max-w-xl mx-auto px-6 pt-16 pb-24 text-[#6B5E54]">
          Opening the door…
        </div>
      </main>
    )
  }

  const isPrivate = tier === 'private_reserve'

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <div className="max-w-lg mx-auto px-6 pt-12 pb-24">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-medium text-[#2C2522] mb-2">
            Further up and further in
          </h1>
          <p className="text-[#6B5E54] text-[16px]">
            Your current place in the house
          </p>
        </div>

        {/* Single card for the member’s actual tier */}
        <div className="rounded-2xl border border-[#E5DFD3] bg-white/70 overflow-hidden mb-8">
          <div className="relative w-full aspect-[3/2]">
            <Image
              src={isPrivate ? '/images/private-reserve.jpg' : '/images/ordinary-pint.jpg'}
              alt={isPrivate ? 'Private Reserve' : 'House Brew'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
            {isPrivate && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#2C2522] text-[#F7F4EF] text-[11px] tracking-wide px-3 py-0.5 rounded-full">
                Deeper Rooms
              </div>
            )}
          </div>
          <div className="p-7">
            <h2 className="text-xl font-medium text-[#2C2522] mb-1">
              {isPrivate ? 'The Private Reserve' : 'The House Brew'}
            </h2>
            <p className="text-sm text-[#6B5E54] mb-4">
              {intervalLabel ? `${intervalLabel} membership` : 'Active membership'}
            </p>
            <ul className="text-[15px] text-[#2C2522] space-y-1.5">
              {isPrivate ? (
                <>
                  <li>• Full access to all Teachings</li>
                  <li>• Galadriel’s Mirror (videos)</li>
                  <li>• Future gatherings & conversations</li>
                  <li>• The deeper rooms as they open</li>
                </>
              ) : (
                <>
                  <li>• Open any Teaching from Titles</li>
                  <li>• Open any Teaching from Browse</li>
                  <li>• Read the Quotes</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          {!isPrivate && (
            <Link
              href="/membership"
              className="block w-full text-center py-3 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-[15px] hover:bg-[#3d342f] transition-colors"
            >
              Would you like to Upgrade your subscription?
            </Link>
          )}

          <Link
            href="/membership/farewell"
            className="block w-full text-center py-3 rounded-lg border border-[#C9BEB0] text-[#6B5E54] text-[15px] hover:bg-[#F0EBE3] transition-colors"
          >
            Would you like to cancel your subscription?
          </Link>
        </div>

        <p className="mt-10 text-center text-[13px] text-[#8A7B65] leading-relaxed">
          You may leave at any time. The threshold remains open.
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2"
          >
            Return to the house
          </Link>
        </div>
      </div>
    </main>
  )
}