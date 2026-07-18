'use client'

import Link from 'next/link'

export default function Header({ active = 'home' }: { active?: string }) {
  return (
    <header className="sticky top-0 bg-[#F7F4EF] border-b border-[#C9BEB0] z-50">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex items-center justify-center h-16">
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
        </nav>
      </div>
    </header>
  )
}