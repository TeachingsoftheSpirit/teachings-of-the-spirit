import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function QuotesPage({ searchParams }: Props) {
  const { category } = await searchParams
  const activeCategory = category || null

  const supabase = await createClient()

  // Fetch all quotes (or filtered by category)
  let query = supabase
    .from('quotes')
    .select('id, quote_text, title, date, year, category, teaching_number')
    .order('year', { ascending: true, nullsFirst: false })
    .order('date', { ascending: true })

  if (activeCategory) {
    query = query.eq('category', activeCategory)
  }

  const { data: quotes, error } = await query

  if (error) {
    console.error(error)
  }

  const allQuotes = quotes || []

  // Get unique categories for the filter buttons
  const { data: categoryRows } = await supabase
    .from('quotes')
    .select('category')
    .not('category', 'is', null)

  const categories = Array.from(
    new Set((categoryRows || []).map(r => r.category).filter(Boolean))
  ).sort() as string[]

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        {/* Consistent navigation */}
        <nav className="mb-10 flex items-center gap-4 text-sm text-[#6B5E54]">
          <Link href="/" className="hover:text-[#2C2522] transition-colors">Home</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/quotes" className="hover:text-[#2C2522] transition-colors">Quotes</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/search" className="hover:text-[#2C2522] transition-colors">Search</Link>
        </nav>

        <header className="mb-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#2C2522] mb-3">
            Quotes
          </h1>
          <p className="text-[#6B5E54] text-lg italic">
            A Mesmerizing Look into the Mind of God
          </p>
        </header>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="mb-14">
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/quotes"
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  !activeCategory
                    ? 'bg-[#2C2522] text-[#F7F4EF] border-[#2C2522]'
                    : 'bg-transparent text-[#6B5E54] border-[#E5DFD5] hover:border-[#6B5E54]'
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/quotes?category=${encodeURIComponent(cat)}`}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#2C2522] text-[#F7F4EF] border-[#2C2522]'
                      : 'bg-transparent text-[#6B5E54] border-[#E5DFD5] hover:border-[#6B5E54]'
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quotes */}
        <div className="space-y-16">
          {allQuotes.map((quote) => (
            <blockquote key={quote.id}>
              <p className="text-[#2C2522] text-lg leading-[1.85] whitespace-pre-wrap mb-5">
                “{quote.quote_text}”
              </p>
              <footer className="text-sm text-[#6B5E54] flex flex-wrap items-center gap-x-3 gap-y-1">
                {quote.teaching_number ? (
                  <Link
                    href={`/teachings/${quote.teaching_number}`}
                    className="hover:text-[#7A3E3E] transition-colors"
                  >
                    — {quote.title}
                  </Link>
                ) : (
                  <span>— {quote.title}</span>
                )}
                {quote.date && (
                  <>
                    <span>·</span>
                    <span>{quote.date}</span>
                  </>
                )}
                {quote.category && (
                  <>
                    <span>·</span>
                    <Link
                      href={`/quotes?category=${encodeURIComponent(quote.category)}`}
                      className="text-[#7A3E3E] hover:underline"
                    >
                      {quote.category}
                    </Link>
                  </>
                )}
              </footer>
            </blockquote>
          ))}
        </div>

        {allQuotes.length === 0 && (
          <p className="text-center text-[#6B5E54] mt-16">
            No quotes found.
          </p>
        )}

        <footer className="mt-24 pt-10 border-t border-[#E5DFD5] text-center text-sm text-[#6B5E54]">
          {activeCategory
            ? `${allQuotes.length} quote${allQuotes.length !== 1 ? 's' : ''} in “${activeCategory}”`
            : `${allQuotes.length} selected quotes`}
        </footer>
      </div>
    </main>
  )
}