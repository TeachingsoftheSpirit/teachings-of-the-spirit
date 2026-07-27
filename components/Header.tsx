'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import EmailCapture from './EmailCapture'
import ReepicheepDoor from './ReepicheepDoor'
import DeskOverlay, { openDesk, type DeskContext } from './DeskOverlay'

const ADMIN_EMAIL = 'jprussell@protonmail.com'
const DESK_OPEN_KEY = 'tot-desk-open'

export default function Header({ active = 'home' }: { active?: string }) {
  const [isVerified, setIsVerified] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isReepicheepOpen, setIsReepicheepOpen] = useState(false)
  const [isEmailCaptureOpen, setIsEmailCaptureOpen] = useState(false)
  const [isDeskOpen, setIsDeskOpen] = useState(false)
  const [deskContext, setDeskContext] = useState<DeskContext | null>(null)

  useEffect(() => {
    // Restore desk across page navigations
    try {
      if (sessionStorage.getItem(DESK_OPEN_KEY) === '1') {
        setIsDeskOpen(true)
      }
    } catch {
      /* ignore */
    }

    const supabase = createClient()
    const applyUser = (user: any) => {
      setIsVerified(!!user)
      setUserEmail(user?.email ?? null)
      setIsAdmin(user?.email === ADMIN_EMAIL)
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      applyUser(user)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null)
    })
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getUser().then(({ data: { user } }) => {
          applyUser(user)
        })
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    const onOpenDesk = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      setDeskContext({
        teachingNumber: detail.teachingNumber ?? null,
        teachingTitle: detail.teachingTitle ?? null,
      })
      try {
        sessionStorage.setItem(DESK_OPEN_KEY, '1')
      } catch {
        /* ignore */
      }
      setIsDeskOpen(true)
    }
    window.addEventListener('tot-open-desk', onOpenDesk)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('tot-open-desk', onOpenDesk)
    }
  }, [])

  const closeDesk = () => {
    try {
      sessionStorage.removeItem(DESK_OPEN_KEY)
    } catch {
      /* ignore */
    }
    setIsDeskOpen(false)
    setDeskContext(null)
  }

  return (
    <>
      <header className="w-full bg-[#F7F4EF] border-b border-[#E5DFD3]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <nav className="relative flex items-center justify-center min-h-[3.85rem] sm:min-h-[4.35rem] text-[15px] sm:text-[16px] text-[#6B5E54]">
            <button
              type="button"
              onClick={() => setIsReepicheepOpen(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-0.5 w-[4.5rem] sm:w-[5.5rem] cursor-pointer group z-20"
              title="Further up and further in"
            >
              <Image
                src="/images/reepicheep.jpg"
                alt="Further up and further in"
                width={36}
                height={36}
                className="object-contain w-8 h-8 sm:w-9 sm:h-9"
              />
              <span className="text-[7px] sm:text-[9px] leading-tight tracking-wide text-[#5C4A3A] text-center group-hover:text-[#2C2522]">
                Further up
                <br />
                and further in
              </span>
              <div
                className="pointer-events-none absolute left-0 top-full mt-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition duration-200 origin-top-left z-50"
                aria-hidden
              >
                <div className="rounded-sm overflow-hidden shadow-xl border border-[#C9BEB0] bg-[#F7F4EF]">
                  <Image
                    src="/images/reepicheep.jpg"
                    alt=""
                    width={160}
                    height={220}
                    className="object-cover w-[7rem] h-[9.5rem] sm:w-[8rem] sm:h-[11rem]"
                  />
                </div>
              </div>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1 px-[4.75rem] sm:px-[6.75rem]">
              <Link
                href="/"
                className={`hover:text-[#2C2522] transition-colors whitespace-nowrap ${
                  active === 'home' ? 'text-[#2C2522] font-medium' : ''
                }`}
              >
                Home
              </Link>
              <Link
                href="/titles"
                className={`hover:text-[#2C2522] transition-colors whitespace-nowrap ${
                  active === 'titles' ? 'text-[#2C2522] font-medium' : ''
                }`}
              >
                Titles
              </Link>
              <Link
                href="/quotes"
                className={`hover:text-[#2C2522] transition-colors whitespace-nowrap ${
                  active === 'quotes' ? 'text-[#2C2522] font-medium' : ''
                }`}
              >
                Quotes
              </Link>
              <Link
                href="/search"
                className={`hover:text-[#2C2522] transition-colors whitespace-nowrap ${
                  active === 'search' ? 'text-[#2C2522] font-medium' : ''
                }`}
              >
                Search
              </Link>
              <Link
                href="/ruminations"
                className={`hover:text-[#2C2522] transition-colors whitespace-nowrap ${
                  active === 'ruminations' ? 'text-[#2C2522] font-medium' : ''
                }`}
              >
                Ruminations
              </Link>
              <Link
                href="/browse"
                className={`hover:text-[#2C2522] transition-colors whitespace-nowrap ${
                  active === 'browse' ? 'text-[#2C2522] font-medium' : ''
                }`}
              >
                Browse
              </Link>
              <Link
                href="/about"
                className={`hover:text-[#2C2522] transition-colors whitespace-nowrap ${
                  active === 'about' ? 'text-[#2C2522] font-medium' : ''
                }`}
              >
                About
              </Link>
            </div>

            {isVerified && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 z-20">
                <button
                  type="button"
                  onClick={() => openDesk()}
                  className="flex flex-col items-center justify-center gap-0.5 w-[3.25rem] sm:w-[3.75rem] cursor-pointer group"
                  title="Your desk"
                >
                  <Image
                    src="/images/Desk.JPG"
                    alt="Your desk"
                    width={32}
                    height={32}
                    className="object-cover w-7 h-7 sm:w-8 sm:h-8 rounded-sm border border-[#C9BEB0]/80"
                  />
                  <span className="text-[7px] sm:text-[9px] leading-tight tracking-wide text-[#5C4A3A] text-center group-hover:text-[#2C2522]">
                    Desk
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 w-[4.25rem] sm:w-[5rem] cursor-pointer group"
                  title={userEmail ?? 'Special Collections'}
                >
                  <Image
                    src="/doors-icon.png"
                    alt="Special Collections"
                    width={32}
                    height={32}
                    className="object-contain w-7 h-7 sm:w-9 sm:h-9"
                  />
                  <span className="text-[7px] sm:text-[9px] leading-tight tracking-wide text-[#5C4A3A] text-center group-hover:text-[#2C2522]">
                    Special
                    <br />
                    Collections
                  </span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <EmailCapture isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <EmailCapture
        isOpen={isEmailCaptureOpen}
        onClose={() => setIsEmailCaptureOpen(false)}
      />
      <ReepicheepDoor
        isOpen={isReepicheepOpen}
        onClose={() => setIsReepicheepOpen(false)}
        onRequestEmailCapture={() => setIsEmailCaptureOpen(true)}
      />
      <DeskOverlay
        isOpen={isDeskOpen}
        onClose={closeDesk}
        context={deskContext}
      />
    </>
  )
}