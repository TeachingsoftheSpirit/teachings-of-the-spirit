'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

const CONTACT_EMAIL = 'hello@teachingsofthespirit.com'

export default function Footer() {
  const [isPaidMember, setIsPaidMember] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
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

  const handleWriteToUs = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 4000)
    }
  }

  return (
    <footer className="mt-20 border-t border-[#E5DFD3] bg-[#F7F4EF]">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B5E54]">
        <div>© 2026 Teachings of the Spirit, LLC. All rights reserved.</div>
        <div className="flex items-center gap-5">
          {isPaidMember && (
            <Link
              href="/membership/manage"
              className="hover:text-[#2C2522] transition-colors underline-offset-2 hover:underline"
            >
              Manage membership
            </Link>
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

          {/* Old Forest door */}
          <Link
            href="/old-forest"
            className="group relative flex items-center"
            title="The Old Forest"
          >
            <Image
              src="/images/tom-bombadil.jpg"
              alt="The Old Forest"
              width={36}
              height={36}
              className="rounded-full object-cover border border-[#D4CBBF] opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-[#F7F4EF] bg-[#2C2522] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              The Old Forest
            </span>
          </Link>
        </div>
      </div>
    </footer>
  )
}