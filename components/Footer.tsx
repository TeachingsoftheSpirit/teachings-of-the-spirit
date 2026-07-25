'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const CONTACT_EMAIL = 'hello@teachingsofthespirit.com'

export default function Footer() {
  const [isPaidMember, setIsPaidMember] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('email', user.email.trim().toLowerCase())
        .maybeSingle()

      if (
        profile?.subscription_status === 'house_brew' ||
        profile?.subscription_status === 'private_reserve'
      ) {
        setIsPaidMember(true)
      }
    }
    check()
  }, [])

  const handleManage = async () => {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/membership/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to open membership portal')
      window.open(data.url, '_blank', 'noopener,noreferrer')
      setOpeningPortal(false)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Unable to open membership portal right now.')
      setOpeningPortal(false)
    }
  }

  const handleWriteToUs = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Clipboard blocked — still show the address so they can copy by hand
      setCopied(true)
      setTimeout(() => setCopied(false), 4000)
    }
  }

  return (
    <footer className="mt-20 border-t border-[#E5DFD3] bg-[#F7F4EF]">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B5E54]">
        <div>
          © 2026 Teachings of the Spirit, LLC. All rights reserved.
        </div>
        <div className="flex items-center gap-5">
          {isPaidMember && (
            <button
              onClick={handleManage}
              disabled={openingPortal}
              className="hover:text-[#2C2522] transition-colors underline-offset-2 hover:underline disabled:opacity-50"
            >
              {openingPortal ? 'Opening…' : 'Manage membership'}
            </button>
          )}
          <button
            type="button"
            onClick={handleWriteToUs}
            className="hover:text-[#2C2522] transition-colors underline-offset-2 hover:underline text-left"
            title={CONTACT_EMAIL}
          >
            {copied ? (
              <span className="text-[#2C2522]">{CONTACT_EMAIL} · copied</span>
            ) : (
              'Write to Us'
            )}
          </button>
        </div>
      </div>
    </footer>
  )
}