'use client'
import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

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
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setView('main')
    setIdentifier('')
    setPassword('')
    setError('')
    setShowPassword(false)
    setCheckoutLoading(null)
    setResetSent(false)
    onClose()
  }

  const resolveEmail = async (value: string): Promise<string | null> => {
    if (value.includes('@')) {
      return value.trim()
    }
    const res = await fetch('/api/auth/resolve-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: value.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'No member found with that username')
    }
    return data.email
  }

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResetSent(false)
    try {
      const emailToUse = await resolveEmail(identifier)
      if (!emailToUse) {
        setError('No member found with that username.')
        setLoading(false)
        return
      }
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Unable to enter right now.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!identifier.trim()) {
      setError('Please enter your email or username first.')
      return
    }
    setLoading(true)
    setError('')
    setResetSent(false)
    try {
      const emailToUse = await resolveEmail(identifier)
      if (!emailToUse) {
        setError('No member found with that username.')
        setLoading(false)
        return
      }
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        emailToUse,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )
      if (resetError) {
        setError(resetError.message)
      } else {
        setResetSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to send reset email.')
    } finally {
      setLoading(false)
    }
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
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

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
                Enter the email or username and the password you chose when you joined.
              </p>
              <form onSubmit={handleMemberLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#6B5E54] mb-1">Email or username</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B5E54] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 pr-10 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7B65] hover:text-[#2C2522] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-xs text-red-700 text-center">{error}</p>
                )}
                {resetSent && (
                  <p className="text-xs text-green-700 text-center">
                    A reset link has been sent to your email.
                  </p>
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
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-xs text-[#6B5E54] hover:text-[#2C2522] underline disabled:opacity-50"
                >
                  Forgot password?
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setView('main')
                      setError('')
                      setResetSent(false)
                    }}
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

      {view === 'expanded' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-[#F7F4EF] shadow-2xl border border-[#E5DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DFD3] sticky top-0 bg-[#F7F4EF] z-10">
              <div>
                <h2 className="text-lg font-medium text-[#2C2522]">
                  I’ll have a brew… or the Private Reserve
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
            <div className="p-5 sm:p-6 grid gap-6 md:grid-cols-2">
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
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-medium text-[#2C2522] mb-1">
                    The House Brew
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