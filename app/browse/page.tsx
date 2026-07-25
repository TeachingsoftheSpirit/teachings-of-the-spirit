import Header from '@/components/Header'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMembershipLevel, canAccess } from '@/lib/membership'

export default async function BrowsePage() {
  const level = await getMembershipLevel()
  const allowOpen = canAccess(level, 'browse_open')

  const supabase = await createClient()
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
        {!allowOpen && (
          <p className="mt-4 text-[14px] text-[#8A7B65] max-w-md mx-auto leading-relaxed">
            The years stand open to view. Stepping into a year is as simple as
            clicking on “Further up and further in!”
          </p>
        )}
      </div>
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allYears.map(({ year, count }) => {
            const cardClass =
              'p-5 rounded-2xl border border-[#C9BEB0] bg-white/60 transition-all'

            if (allowOpen) {
              return (
                <Link
                  key={year}
                  href={`/browse/${year}`}
                  className={`group ${cardClass} hover:border-[#7A3E3E] hover:bg-white`}
                >
                  <div className="text-2xl font-medium text-[#2C2522] group-hover:text-[#7A3E3E]">
                    {year}
                  </div>
                  <div className="text-sm text-[#6B5E54] mt-1">
                    {count} teaching{count !== 1 ? 's' : ''}
                  </div>
                </Link>
              )
            }

            return (
              <div
                key={year}
                className={`${cardClass} opacity-55 cursor-default select-none`}
                aria-disabled="true"
              >
                <div className="text-2xl font-medium text-[#2C2522]">{year}</div>
                <div className="text-sm text-[#6B5E54] mt-1">
                  {count} teaching{count !== 1 ? 's' : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}