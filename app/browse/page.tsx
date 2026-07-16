import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BrowsePage() {
  const supabase = await createClient()

  const { data: yearsData } = await supabase
    .from('teachings')
    .select('year')
    .not('year', 'is', null)
    .order('year', { ascending: true })

  const yearCounts = {}
  for (const row of yearsData || []) {
    if (row.year) {
      yearCounts[row.year] = (yearCounts[row.year] || 0) + 1
    }
  }

  const years = Object.keys(yearCounts)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        <nav className="mb-10 flex items-center gap-4 text-sm text-[#6B5E54]">
          <Link href="/" className="hover:text-[#2C2522] transition-colors">Home</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/quotes" className="hover:text-[#2C2522] transition-colors">Quotes</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/search" className="hover:text-[#2C2522] transition-colors">Search</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/browse" className="hover:text-[#2C2522] transition-colors">Browse</Link>
        </nav>

        <header className="mb-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#2C2522] mb-3">
            Browse by Year
          </h1>
          <p className="text-[#6B5E54]">
            {years.length} years · {Object.values(yearCounts).reduce((a, b) => a + b, 0)} teachings
          </p>
        </header>

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
