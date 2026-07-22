'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import EmailCapture from './EmailCapture'
import ReepicheepDoor from './ReepicheepDoor'

const ADMIN_EMAIL = 'jprussell@protonmail.com'

export default function Header({ active = 'home' }: { active?: string }) {
  const [isVerified, setIsVerified] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isReepicheepOpen, setIsReepicheepOpen] = useState(false)
  const [isEmailCaptureOpen, setIsEmailCaptureOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const applyUser = (user: any) => {
      setIsVerified(!!user)
      setUserEmail(user?.email ?? null)
      setIsAdmin(user?.email === ADMIN_EMAIL)
    }

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      applyUser(user)
    })

    // Live updates (critical for the original tab after magic-link verify)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applyUser(session?.user ?? null)
      }
    )

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getUser().then(({ data: { user } }) => {
          applyUser(user)
        })
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 bg-[#F7F4EF] border-b border-[#C9BEB0] z-50">
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <nav className="flex items-center justify-center h-12 sm:h-16 relative">

            {isAdmin && (
              <Link
                href="/admin"
                className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center group"
                title="Admin"
              >
                <span className="text-lg sm:text-xl leading-none text-[#5C4A3A] opacity-70 group-hover:opacity-100 transition-opacity">
                  ⌘
                </span>
                <span className="text-[7px] sm:text-[9px] leading-none mt-0.5 tracking-wide text-[#5C4A3A]">
                  Admin
                </span>
              </Link>
            )}

            <button
              onClick={() => setIsReepicheepOpen(true)}
              className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer ${isAdmin ? 'left-12 sm:left-14' : 'left-0'}`}
              title="Further up and further in!"
            >
              <Image
                src="/images/reepicheep.jpg"
                alt="Further up and further in!"
                width={36}
                height={36}
                className="object-contain sm:w-10 sm:h-10"
              />
              <span className="text-[7px] sm:text-[9px] leading-none mt-0.5 tracking-wide text-[#5C4A3A]">
                Further up and further in!
              </span>

              <div className="absolute left-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                <div className="bg-[#F7F4EF] border border-[#C9BEB0] rounded-lg shadow-lg p-2">
                  <Image
                    src="/images/reepicheep.jpg"
                    alt="Further up and further in!"
                    width={220}
                    height={220}
                    className="object-contain rounded"
                  />
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2.5 sm:gap-8 text-[10px] sm:text-sm uppercase tracking-wider sm:tracking-widest text-[#6B5E54]">
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
                  width={28}
                  height={28}
                  className="object-contain sm:w-9 sm:h-9"
                />
                <span className="text-[7px] sm:text-[9px] leading-none mt-0.5 tracking-wide text-[#5C4A3A]">
                  Special Collections
                </span>
              </button>
            )}
          </nav>
        </div>
      </header>

      <EmailCapture
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <EmailCapture
        isOpen={isEmailCaptureOpen}
        onClose={() => setIsEmailCaptureOpen(false)}
      />

      <ReepicheepDoor
        isOpen={isReepicheepOpen}
        onClose={() => setIsReepicheepOpen(false)}
        onRequestEmailCapture={() => setIsEmailCaptureOpen(true)}
      />
    </>
  )
}