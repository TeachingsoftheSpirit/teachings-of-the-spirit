import Header from '@/components/Header'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function BrowsePage() {
  const supabase = await createClient()

  const { data: years } = await supabase
    .from('teachings')
    .select('year')
    .not('year', 'is', null)

  // Get unique years with count
  const yearCounts: { [key: number]: number } = {}
  years?.forEach((t) => {
    if (t.year) {
      yearCounts[t.year] = (yearCounts[t.year] || 0) + 1
    }
  })

  const sortedYears = Object.entries(yearCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => b.year - a.year)

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="browse" />

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522]">
          Browse by Year
        </h1>
        <p className="mt-2 text-lg text-[#6B5E54] italic">
          Explore the teachings year by year
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 content-area rounded-xl p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedYears.map(({ year, count }) => (
            <Link
              key={year}
              href={`/browse/${year}`}
              className="group p-5 rounded-xl border border-[#C9BEB0] hover:border-[#7A3E3E] transition-all bg-white/60 hover:bg-white"
            >
              <div className="text-2xl font-medium text-[#2C2522] group-hover:text-[#7A3E3E]">
                {year}
              </div>
              <div className="text-sm text-[#6B5E54] mt-1">
                {count} teaching{count !== 1 ? 's' : ''}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}