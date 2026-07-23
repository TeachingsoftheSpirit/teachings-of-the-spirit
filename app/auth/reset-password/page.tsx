'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash.
    // We just need to wait a moment for the client to pick it up.
    const timer = setTimeout(() => setReady(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2500)
    } catch (err: any) {
      setError(err.message || 'Unable to update password.')
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
        <p className="text-sm text-[#6B5E54]">Preparing…</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-[#E5DFD3] p-8 text-center">
          <h1 className="text-xl font-medium text-[#2C2522] mb-3">
            Password updated
          </h1>
          <p className="text-sm text-[#6B5E54]">
            You can now sign in with your new password.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-[#E5DFD3] p-8">
        <h1 className="text-xl font-medium text-[#2C2522] mb-1 text-center">
          Choose a new password
        </h1>
        <p className="text-sm text-[#6B5E54] text-center mb-6">
          Enter a password you will remember.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#6B5E54] mb-1">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7B65] hover:text-[#2C2522]"
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
            <label className="block text-xs text-[#6B5E54] mb-1">Confirm password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 rounded-lg border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:ring-1 focus:ring-[#2C2522]"
              autoComplete="new-password"
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
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  )
}