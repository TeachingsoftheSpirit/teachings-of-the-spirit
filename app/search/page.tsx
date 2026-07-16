import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const supabase = await createClient()

  let teachings: any[] = []

  if (query) {
    const { data } = await supabase
      .from('teachings')
      .select('teaching_number, title, year, full_text')
      .or(`title.ilike.%${query}%,full_text.ilike.%${query}%`)
      .order('teaching_number', { ascending: true })
      .limit(50)

    teachings = data || []
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16">

        {/* Consistent navigation */}
        <nav className="mb-10 flex flex-wrap items-center gap-4 text-sm text-[#6B5E54]">
  <Link href="/" className="hover:text-[#2C2522] transition-colors">Home</Link>
  <span className="text-[#E5DFD5]">·</span>
  <Link href="/quotes" className="hover:text-[#2C2522] transition-colors">Quotes</Link>
  <span className="text-[#E5DFD5]">·</span>
  <Link href="/search" className="hover:text-[#2C2522] transition-colors">Search</Link>
  <span className="text-[#E5DFD5]">·</span>
  <Link href="/browse" className="hover:text-[#2C2522] transition-colors">Browse</Link>
  <span className="text-[#E5DFD5]">·</span>
  <Link href="/titles" className="hover:text-[#2C2522] transition-colors">Titles</Link>
</nav>

        <h1 className="text-3xl font-medium tracking-tight text-[#2C2522] mb-8">
          Search
        </h1>

        {/* Search form */}
        <form action="/search" method="get" className="mb-12">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search titles and full text..."
            autoFocus
            className="w-full px-5 py-3.5 rounded-lg border border-[#E5DFD5] bg-white text-[#2C2522] placeholder:text-[#6B5E54] focus:outline-none focus:ring-1 focus:ring-[#7A3E3E] focus:border-[#7A3E3E] text-lg"
          />
        </form>

        {/* Results */}
        {query ? (
          <div>
            <p className="text-sm text-[#6B5E54] mb-6">
              {teachings.length} result{teachings.length !== 1 ? 's' : ''} for “{query}”
            </p>

            <div className="space-y-1">
              {teachings.map((teaching) => (
                <Link
                  key={teaching.teaching_number}
                  href={`/teachings/${teaching.teaching_number}`}
                  className="group block py-4 px-2 -mx-2 rounded-md hover:bg-[#EDE7DC] transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-4 min-w-0">
                      <span className="text-[#6B5E54] text-sm tabular-nums w-10 shrink-0">
                        {teaching.teaching_number}
                      </span>
                      <span className="text-[#2C2522] group-hover:text-[#7A3E3E] text-lg">
                        {teaching.title}
                      </span>
                    </div>
                    {teaching.year && (
                      <span className="text-[#6B5E54] text-sm shrink-0">
                        {teaching.year}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {teachings.length === 0 && (
              <p className="text-[#6B5E54] mt-8">
                No teachings matched your search.
              </p>
            )}
          </div>
        ) : (
          <p className="text-[#6B5E54]">
            Type a word or phrase above to search the teachings.
          </p>
        )}
      </div>
    </main>
  )
}