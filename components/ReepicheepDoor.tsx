'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ReepicheepDoorProps {
  isOpen: boolean
  onClose: () => void
  onRequestEmailCapture: () => void
}

export default function ReepicheepDoor({
  isOpen,
  onClose,
  onRequestEmailCapture,
}: ReepicheepDoorProps) {
  const [view, setView] = useState<'main' | 'member' | 'expanded'>('main')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const handleClose = () => {
    setView('main')
    setEmail('')
    setPassword('')
    setError('')
    setCheckoutLoading(null)
    onClose()
  }

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      setLoading(false)
      setError('Password login will be connected in the next step.')
    }, 800)
  }

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId)
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
        setCheckoutLoading(null)
      }
    } catch (err) {
      console.error(err)
      alert('Unable to start checkout')
      setCheckoutLoading(null)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* ───────── Main card ───────── */}
      {view === 'main' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-sm rounded-2xl bg-[#F7F4EF] shadow-2xl overflow-hidden border border-[#E5DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/doors-of-durin-full.JPG"
                alt="The Doors of Durin"
                fill
                className="object-cover"
                sizes="400px"
                priority
              />
            </div>

            <div className="p-6 text-center">
              <h2 className="text-xl font-medium text-[#2C2522] mb-3">
                Speak Friend and Enter
              </h2>
              <p className="text-sm text-[#6B5E54] leading-relaxed mb-6">
                If you click “Enter with your email”, you will immediately receive an email to verify that you are you.
                When you click the Verify button in that email, you will be brought right back here for free access to hundreds of Teachings with no password required.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    onRequestEmailCapture()
                    onClose()
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors"
                >
                  Enter with your email
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-[#E5DFD3]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9BEB0]" />
                  <div className="flex-1 h-px bg-[#E5DFD3]" />
                </div>

                <button
                  onClick={() => setView('member')}
                  className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors"
                >
                  Already a Member?
                </button>

                <button
                  onClick={() => setView('expanded')}
                  className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors"
                >
                  Further up and Further In
                </button>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors"
                >
                  Go Back!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Already a Member ───────── */}
      {view === 'member' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-sm rounded-2xl bg-[#F7F4EF] shadow-2xl overflow-hidden border border-[#E5DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/doors-of-durin-full.JPG"
                alt="The Doors of Durin"
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>

            <div className="p-6">
              <h2 className="text-xl font-medium text-[#2C2522] mb-1 text-center">
                Welcome back
              </h2>
              <p className="text-sm text-[#6B5E54] text-center mb-6">
                Enter the email and password you chose when you joined.
              </p>

              <form onSubmit={handleMemberLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#6B5E54] mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B5E54] mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-700 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors disabled:opacity-60"
                >
                  {loading ? 'Entering…' : 'Enter'}
                </button>
              </form>

              <div className="mt-4 text-center space-y-2">
                <button
                  type="button"
                  className="text-xs text-[#6B5E54] hover:text-[#2C2522] underline"
                >
                  Forgot password?
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => setView('main')}
                    className="text-xs text-[#6B5E54] hover:text-[#2C2522]"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Further up: two subscription cards ───────── */}
      {view === 'expanded' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-[#F7F4EF] shadow-2xl border border-[#E5DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DFD3] sticky top-0 bg-[#F7F4EF] z-10">
              <div>
                <h2 className="text-lg font-medium text-[#2C2522]">
                  I’ll have a pint, please
                </h2>
                <p className="text-sm text-[#6B5E54] mt-0.5">
                  Further up and further in
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-sm text-[#6B5E54] hover:text-[#2C2522] transition-colors"
              >
                Close
              </button>
            </div>

            {/* Two cards */}
            <div className="p-5 sm:p-6 grid gap-6 md:grid-cols-2">

              {/* Ordinary Pint */}
              <div className="rounded-2xl border border-[#E5DFD3] bg-white/60 overflow-hidden flex flex-col">
                <div className="relative w-full aspect-[3/2]">
                  <Image
                    src="/images/ordinary-pint.jpg"
                    alt="A quiet pint in an old Oxford pub"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-medium text-[#2C2522] mb-1">
                    The Ordinary Pint
                  </h3>
                  <p className="text-sm text-[#6B5E54] mb-5">
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
                      disabled={!!checkoutLoading}
                      className="w-full py-2.5 rounded-lg border border-[#C9BEB0] text-[#2C2522] text-sm hover:bg-[#F7F4EF] transition-colors disabled:opacity-60"
                    >
                      {checkoutLoading === 'price_1TvnT3DAWPDfVwdnpN1woX0c' ? 'Redirecting…' : 'Monthly — $2.50'}
                    </button>
                    <button
                      onClick={() => handleCheckout('price_1TvnTaDAWPDfVwdnrquyVBlD')}
                      disabled={!!checkoutLoading}
                      className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors disabled:opacity-60"
                    >
                      {checkoutLoading === 'price_1TvnTaDAWPDfVwdnrquyVBlD' ? 'Redirecting…' : 'Annual — $17.95'}
                      {checkoutLoading !== 'price_1TvnTaDAWPDfVwdnrquyVBlD' && (
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
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-medium text-[#2C2522] mb-1">
                    The Private Reserve
                  </h3>
                  <p className="text-sm text-[#6B5E54] mb-5">
                    Everything in the Ordinary Pint, and more
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
                      disabled={!!checkoutLoading}
                      className="w-full py-2.5 rounded-lg border border-[#C9BEB0] text-[#2C2522] text-sm hover:bg-[#F7F4EF] transition-colors disabled:opacity-60"
                    >
                      {checkoutLoading === 'price_1TvnUGDAWPDfVwdnb0dPIKXk' ? 'Redirecting…' : 'Monthly — $10'}
                    </button>
                    <button
                      onClick={() => handleCheckout('price_1TvnUpDAWPDfVwdnAN2oCC24')}
                      disabled={!!checkoutLoading}
                      className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors disabled:opacity-60"
                    >
                      {checkoutLoading === 'price_1TvnUpDAWPDfVwdnAN2oCC24' ? 'Redirecting…' : 'Annual — $99'}
                      {checkoutLoading !== 'price_1TvnUpDAWPDfVwdnAN2oCC24' && (
                        <span className="opacity-70 text-xs ml-1">(save $21)</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <p className="px-6 pb-6 text-center text-sm text-[#6B5E54]">
              You may leave at any time. The threshold remains open.
            </p>

            <div className="px-6 pb-5 text-center">
              <button
                onClick={() => setView('main')}
                className="text-sm text-[#6B5E54] hover:text-[#2C2522] transition-colors"
              >
                ← Return to Speak Friend and Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}