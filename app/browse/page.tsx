import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BrowsePage() {
  const supabase = await createClient()

  const { data: yearsData } = await supabase
    .from('teachings')
    .select('year')
    .not('year', 'is', null)
    .order('year', { ascending: true })

  const yearCounts: Record<number, number> = {}
  for (const row of yearsData || []) {
    if (row.year) {
      yearCounts[row.year] = (yearCounts[row.year] || 0) + 1
    }
  }

  const years = Object.keys(yearCounts)
    .map(Number)
    .sort((a, b) => a - b)

  const total = Object.values(yearCounts).reduce((a, b) => a + b, 0)

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        <header className="mb-16 text-center">
          <div className="min-h-[4.5rem] sm:min-h-[5.25rem] flex items-center justify-center mb-3">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#2C2522]">
              Browse
            </h1>
          </div>
          <p className="text-[#6B5E54] text-lg italic mb-8 min-h-[1.75rem]">
            Walk the years of the conversation
          </p>
          <nav className="flex flex-wrap justify-center items-center gap-5 text-sm">
            <Link href="/" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Home</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/quotes" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Quotes</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/search" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Search</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/browse" className="text-[#7A3E3E] font-medium drop-shadow-[0_0_8px_rgba(122,62,62,0.45)]">Browse</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/titles" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Titles</Link>
          </nav>
        </header>

        <p className="text-center text-[#6B5E54] mb-10">
          {years.length} years · {total.toLocaleString()} teachings
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {years.map((year) => (
            <Link
              key={year}
              href={`/browse/${year}`}
              className="group block p-5 rounded-lg border border-[#E5DFD5] bg-white/50 hover:bg-[#EDE7DC] hover:border-[#6B5E54] transition-colors text-center"
            >
              <div className="text-2xl font-medium text-[#2C2522] group-hover:text-[#7A3E3E] transition-colors">
                {year}
              </div>
              <div className="text-sm text-[#6B5E54] mt-1">
                {yearCounts[year]} teaching{yearCounts[year] !== 1 ? 's' : ''}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}