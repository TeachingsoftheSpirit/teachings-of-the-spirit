import Link from 'next/link'

interface BackLinkProps {
  href: string
  label?: string
}

export default function BackLink({ href, label = '← Back' }: BackLinkProps) {
  // Safety check
  if (!href) {
    return null
  }

  return (
    <Link 
      href={href} 
      className="inline-flex items-center text-sm text-[#6B5E54] hover:text-[#7A3E3E] transition-colors mb-6"
    >
      {label}
    </Link>
  )
}