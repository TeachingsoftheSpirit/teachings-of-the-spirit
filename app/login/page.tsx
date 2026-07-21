'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('sent')
      setMessage('A sign-in link has been sent to your email. Check your inbox.')
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
          A quiet door for those who keep the house.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-[#6B5E54] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD3] bg-white text-[#2C2522] focus:outline-none focus:ring-2 focus:ring-[#C9BEB0]"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'sent'}
            className="w-full py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm tracking-wide hover:bg-[#3d342f] transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Sending…' : status === 'sent' ? 'Link Sent' : 'Send Sign-in Link'}
          </button>
        </form>

        {message && (
          <p className={`mt-6 text-center text-sm ${status === 'error' ? 'text-red-700' : 'text-[#6B5E54]'}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  )
}