'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/client'

function WelcomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState('')
  const [interval, setInterval] = useState('')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setError('No session found. Please return to the membership page and try again.')
      setLoading(false)
      return
    }

    const complete = async () => {
      try {
        const res = await fetch('/api/membership/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Unable to complete membership')
        setEmail(data.email)
        setTier(data.tier)
        setInterval(data.interval)
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    complete()
  }, [sessionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setFormError('The two passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/membership/set-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          username: username.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Unable to finish setting up your membership.')
        setSubmitting(false)
        return
      }

      // Sign the user in immediately so Special Collections appears
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Credentials were saved, but auto-login failed.
        // Still show success so the user can log in manually.
        console.error('Auto sign-in failed:', signInError)
        setDone(true)
        setSubmitting(false)
        return
      }

      // Fully signed in — go straight to the main room
      router.push('/')
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'Unable to finish setting up your membership.')
      setSubmitting(false)
    }
  }

  const tierLabel =
    tier === 'house_brew' ? 'House Brew' :
    tier === 'private_reserve' ? 'Private Reserve' : tier

  const intervalLabel =
    interval === 'monthly' ? 'Monthly' :
    interval === 'annual' ? 'Annual' : interval

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-6 pt-20 pb-24 text-center text-[#6B5E54]">
        Opening the threshold…
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 pt-20 pb-24 text-center">
        <p className="text-[#2C2522] mb-4">{error}</p>
        <button
          onClick={() => router.push('/membership')}
          className="text-sm text-[#6B5E54] hover:text-[#2C2522] underline"
        >
          Return to membership
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 pt-20 pb-24 text-center">
        <h1 className="text-2xl font-medium text-[#2C2522] mb-3">
          Welcome further in
        </h1>
        <p className="text-[#6B5E54] mb-8 leading-relaxed">
          Your {tierLabel} membership is active.
          <br />
          You may now enter the rooms from any device using the username and password you just chose.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-[#2C2522] text-[#F7F4EF] rounded-lg text-sm hover:bg-[#3d342f] transition-colors"
        >
          Enter the Main Room
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-24">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-medium text-[#2C2522] mb-2">
          One last step
        </h1>
        <p className="text-[#6B5E54] text-[15px] leading-relaxed">
          Your <strong>{tierLabel}</strong>
          {intervalLabel && <> – {intervalLabel}</>} membership is ready.
          <br />
          Choose a username and a password so you can enter from any device.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs text-[#6B5E54] mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="a name others will see"
            className="w-full px-3 py-2.5 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-xs text-[#6B5E54] mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 8 characters"
              className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
              autoComplete="new-password"
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

        <div>
          <label className="block text-xs text-[#6B5E54] mb-1.5">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7B65] hover:text-[#2C2522] transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? (
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
          {confirm.length > 0 && password !== confirm && (
            <p className="mt-1.5 text-xs text-red-700">Passwords do not match</p>
          )}
        </div>

        {formError && (
          <p className="text-sm text-red-700 text-center">{formError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Enter the rooms'}
        </button>
      </form>

      <p className="mt-8 text-center text-[12px] text-[#8A7B65] leading-relaxed">
        We will never sell, trade, or give away your email or username.
        They are used only to open the rooms for you.
      </p>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <Suspense fallback={<div className="max-w-md mx-auto px-6 pt-20 text-center text-[#6B5E54]">Loading…</div>}>
        <WelcomeContent />
      </Suspense>
    </main>
  )
}