'use client'

import { Suspense, useState } from 'react'
import Header from '@/components/Header'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

function MembershipContent() {
  const [loading, setLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong')
        setLoading(null)
      }
    } catch (err) {
      console.error(err)
      alert('Unable to start checkout')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
      {success && (
        <div className="mb-8 rounded-xl border border-[#C9BEB0] bg-white/70 px-5 py-4 text-center text-[#2C2522]">
          Thank you. Your membership is active. Welcome further in.
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#2C2522] mb-3">
          I’ll have the House Brew, please
        </h1>
        <p className="text-[#6B5E54] text-[17px] max-w-xl mx-auto leading-relaxed">
          So glad you’ve found our library.
          <br />
          There’s more we have to offer: further up and further in!
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* House Brew */}
        <div className="rounded-2xl border border-[#E5DFD3] bg-white/60 overflow-hidden flex flex-col">
          <div className="relative w-full aspect-[3/2]">
            <Image
              src="/images/ordinary-pint.jpg"
              alt="A quiet house brew in an old Oxford pub"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="p-8 flex flex-col flex-1">
            <h2 className="text-xl font-medium text-[#2C2522] mb-1">
              The House Brew
            </h2>
            <p className="text-sm text-[#6B5E54] mb-6">
              Full access to the library
            </p>
            <ul className="text-[15px] text-[#2C2522] space-y-2 mb-8 flex-1">
              <li>• Open any Teaching from Titles</li>
              <li>• Open any Teaching from Browse</li>
              <li>• Read the Quotes</li>
            </ul>
            <div className="space-y-3">
              <button
                onClick={() => handleCheckout('price_1TvnT3DAWPDfVwdnpN1woX0c')}
                disabled={!!loading}
                className="w-full py-2.5 rounded-lg border border-[#C9BEB0] text-[#2C2522] text-sm hover:bg-[#F7F4EF] transition-colors disabled:opacity-60"
              >
                {loading === 'price_1TvnT3DAWPDfVwdnpN1woX0c' ? 'Redirecting…' : 'Monthly — $2.50'}
              </button>
              <button
                onClick={() => handleCheckout('price_1TvnTaDAWPDfVwdnrquyVBlD')}
                disabled={!!loading}
                className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors disabled:opacity-60"
              >
                {loading === 'price_1TvnTaDAWPDfVwdnrquyVBlD' ? 'Redirecting…' : 'Annual — $17.95'}
                {loading !== 'price_1TvnTaDAWPDfVwdnrquyVBlD' && (
                  <span className="opacity-70 text-xs ml-1">(save $12)</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Private Reserve */}
        <div className="rounded-2xl border border-[#C9BEB0] bg-white/80 overflow-hidden flex flex-col relative">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#2C2522] text-[#F7F4EF] text-[11px] tracking-wide px-3 py-0.5 rounded-full">
            Deeper Rooms
          </div>
          <div className="relative w-full aspect-[3/2]">
            <Image
              src="/images/private-reserve.jpg"
              alt="A fine brandy in a quiet study"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="p-8 flex flex-col flex-1">
            <h2 className="text-xl font-medium text-[#2C2522] mb-1">
              The Private Reserve
            </h2>
            <p className="text-sm text-[#6B5E54] mb-6">
              Everything in the House Brew, and more
            </p>
            <ul className="text-[15px] text-[#2C2522] space-y-2 mb-8 flex-1">
              <li>• Full access to all Teachings</li>
              <li>• Galadriel’s Mirror (videos)</li>
              <li>• Future gatherings & conversations</li>
              <li>• The deeper rooms as they open</li>
            </ul>
            <div className="space-y-3">
              <button
                onClick={() => handleCheckout('price_1TvnUGDAWPDfVwdnb0dPIKXk')}
                disabled={!!loading}
                className="w-full py-2.5 rounded-lg border border-[#C9BEB0] text-[#2C2522] text-sm hover:bg-[#F7F4EF] transition-colors disabled:opacity-60"
              >
                {loading === 'price_1TvnUGDAWPDfVwdnb0dPIKXk' ? 'Redirecting…' : 'Monthly — $10'}
              </button>
              <button
                onClick={() => handleCheckout('price_1TvnUpDAWPDfVwdnAN2oCC24')}
                disabled={!!loading}
                className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors disabled:opacity-60"
              >
                {loading === 'price_1TvnUpDAWPDfVwdnAN2oCC24' ? 'Redirecting…' : 'Annual — $99'}
                {loading !== 'price_1TvnUpDAWPDfVwdnAN2oCC24' && (
                  <span className="opacity-70 text-xs ml-1">(save $21)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-12 text-center text-sm text-[#6B5E54]">
        You may leave at any time. The threshold remains open.
      </p>
    </div>
  )
}

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <Suspense fallback={<div className="max-w-4xl mx-auto px-6 pt-12 pb-24 text-center text-[#6B5E54]">Loading…</div>}>
        <MembershipContent />
      </Suspense>
    </main>
  )
}