'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Link from 'next/link'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('') // username or email
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const supabase = createClient()
      let email = identifier.trim()

      // If it doesn't look like an email, resolve username → email
      if (!email.includes('@')) {
        const res = await fetch('/api/auth/resolve-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email }),
        })
        const data = await res.json()
        if (!res.ok || !data.email) {
          throw new Error(data.error || 'Username not found')
        }
        email = data.email
      }

      // Sign in with password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Check membership / grace period
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, access_ends_at')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      if (profile?.subscription_status === 'canceled') {
        const endsAt = profile.access_ends_at ? new Date(profile.access_ends_at) : null
        const now = new Date()

        if (endsAt && endsAt > now) {
          // Still inside the grace period — allow login
          window.location.href = '/'
          return
        }

        // Grace period over
        await supabase.auth.signOut()
        setStatus('error')
        setMessage(
          'Your membership has ended. You may renew any time from the membership page.'
        )
        return
      }

      // Active member or free verified user
      window.location.href = '/'
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Unable to sign in. Please check your details.')
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <div className="max-w-md mx-auto px-6 pt-20 pb-24">
        <h1 className="text-3xl font-medium text-[#2C2522] text-center mb-2">
          Enter the Rooms
        </h1>
        <p className="text-center text-[#6B5E54] mb-10 text-[15px]">
          Sign in with your username or email and password.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-sm text-[#6B5E54] mb-1.5">
              Username or Email
            </label>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD3] bg-white text-[#2C2522] focus:outline-none focus:ring-2 focus:ring-[#C9BEB0]"
              placeholder="username or you@example.com"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-[#6B5E54] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD3] bg-white text-[#2C2522] focus:outline-none focus:ring-2 focus:ring-[#C9BEB0]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm tracking-wide hover:bg-[#3d342f] transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {message && (
          <p className={`mt-6 text-center text-sm ${status === 'error' ? 'text-red-700' : 'text-[#6B5E54]'}`}>
            {message}
          </p>
        )}

        <div className="mt-8 text-center text-sm text-[#6B5E54] space-y-2">
          <p>
            <Link href="/auth/reset-password" className="underline underline-offset-2 hover:text-[#2C2522]">
              Forgot password?
            </Link>
          </p>
          <p>
            Don’t have an account?{' '}
            <Link href="/membership" className="underline underline-offset-2 hover:text-[#2C2522]">
              Become a member
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}