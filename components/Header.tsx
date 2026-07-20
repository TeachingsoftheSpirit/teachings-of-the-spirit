'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import EmailCapture from './EmailCapture'

export default function Header({ active = 'home' }: { active?: string }) {
  const [isVerified, setIsVerified] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsVerified(!!user)
      setUserEmail(user?.email ?? null)
    }
    check()

    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return (
    <>
      <header className="sticky top-0 bg-[#F7F4EF] border-b border-[#C9BEB0] z-50">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex items-center justify-center h-16 relative">
            <div className="flex items-center gap-8 text-sm uppercase tracking-widest text-[#6B5E54]">
              <Link href="/" className={`hover:text-[#2C2522] transition-colors ${active === 'home' ? 'text-[#2C2522] font-medium' : ''}`}>
                Home
              </Link>
              <Link href="/quotes" className={`hover:text-[#2C2522] transition-colors ${active === 'quotes' ? 'text-[#2C2522] font-medium' : ''}`}>
                Quotes
              </Link>
              <Link href="/search" className={`hover:text-[#2C2522] transition-colors ${active === 'search' ? 'text-[#2C2522] font-medium' : ''}`}>
                Search
              </Link>
              <Link href="/titles" className={`hover:text-[#2C2522] transition-colors ${active === 'titles' ? 'text-[#2C2522] font-medium' : ''}`}>
                Titles
              </Link>
              <Link href="/browse" className={`hover:text-[#2C2522] transition-colors ${active === 'browse' ? 'text-[#2C2522] font-medium' : ''}`}>
                Browse
              </Link>
              <Link href="/about" className={`hover:text-[#2C2522] transition-colors ${active === 'about' ? 'text-[#2C2522] font-medium' : ''}`}>
                About
              </Link>
            </div>

            {isVerified && (
              <button
                onClick={() => setIsOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                title={userEmail ?? 'Special Collections'}
              >
                <Image
                  src="/doors-icon.png"
                  alt="Special Collections"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className="text-[9px] leading-none mt-0.5 tracking-wide text-[#5C4A3A]">
                  Special Collections
                </span>
                {userEmail && (
                  <div className="absolute top-full mt-2 px-2.5 py-1 bg-[#2A241C] text-[#F7F1E6] text-[11px] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {userEmail}
                  </div>
                )}
              </button>
            )}
          </nav>
        </div>
      </header>

      <EmailCapture
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}