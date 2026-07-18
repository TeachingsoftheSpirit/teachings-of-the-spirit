import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 bg-[#F7F4EF] border-b border-[#C9BEB0] z-50">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex items-center justify-center h-16">
          <div className="flex items-center gap-8 text-sm uppercase tracking-widest text-[#6B5E54]">
            <Link href="/">Home</Link>
            <Link href="/quotes">Quotes</Link>
            <Link href="/search">Search</Link>
            <Link href="/titles">Titles</Link>
            <Link href="/browse">Browse</Link>
            <Link href="/about">About</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}