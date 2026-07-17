import Link from 'next/link'

export default function Header({ active = 'home' }: { active?: string }) {
  const links = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/quotes', label: 'Quotes', key: 'quotes' },
    { href: '/search', label: 'Search', key: 'search' },
    { href: '/browse', label: 'Browse', key: 'browse' },
    { href: '/titles', label: 'Titles', key: 'titles' },
    { href: '/about', label: 'About', key: 'about' },
  ]

  return (
    <nav className="sticky top-0 z-50 sticky-nav py-4">
      <div className="max-w-3xl mx-auto px-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={
              active === link.key
                ? 'text-[#7A3E3E] font-medium drop-shadow-[0_0_6px_rgba(122,62,62,0.25)]'
                : 'text-[#6B5E54] hover:text-[#7A3E3E] transition-colors'
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}