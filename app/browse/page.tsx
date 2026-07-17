import Header from '@/components/Header'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function BrowsePage() {
  const supabase = await createClient()

  // Get all years that have teachings
  const { data: yearsData } = await supabase
    .from('teachings')
    .select('year')
    .not('year', 'is', null)

  const yearCounts: { [key: number]: number } = {}
  yearsData?.forEach((t) => {
    if (t.year) {
      yearCounts[t.year] = (yearCounts[t.year] || 0) + 1
    }
  })

  // Create full range 1979–2003
  const allYears = []
  for (let y = 1979; y <= 2003; y++) {
    allYears.push({
      year: y,
      count: yearCounts[y] || 0,
    })
  }

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

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allYears.map(({ year, count }) => (
            <Link
              key={year}
              href={`/browse/${year}`}
              className="group p-5 rounded-2xl border border-[#C9BEB0] hover:border-[#7A3E3E] transition-all bg-white/60 hover:bg-white"
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