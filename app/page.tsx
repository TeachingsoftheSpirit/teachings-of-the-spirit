import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: teachings } = await supabase
    .from('teachings')
    .select('teaching_number, title, year')
    .order('teaching_number', { ascending: false })
    .limit(24)

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 sm:py-28">

               {/* Header */}
        <header className="mb-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#2C2522] mb-5">
            Teachings of the Spirit
          </h1>
          <p className="text-[#6B5E54] text-lg leading-relaxed max-w-lg mx-auto mb-8">
            A private library of spiritual teachings received over many years.
          </p>
          <div className="flex justify-center gap-6 text-sm mt-6">
  <Link href="/" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">
    Home
  </Link>
  <span className="text-[#E5DFD5]">·</span>
  <Link href="/quotes" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">
    Quotes
  </Link>
  <span className="text-[#E5DFD5]">·</span>
  <Link href="/search" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">
    Search
  </Link>
</div>
        </header>
        {/* Search */}
        <div className="mb-20">
          <form action="/search" method="get">
            <input
              type="search"
              name="q"
              placeholder="Search the teachings..."
              className="w-full px-5 py-4 bg-[#F0EBE3] border border-[#E5DFD5] rounded-md text-[#2C2522] placeholder:text-[#6B5E54] focus:outline-none focus:ring-1 focus:ring-[#7A3E3E] focus:border-[#7A3E3E] text-lg"
            />
          </form>
        </div>

        {/* Recent Teachings */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#6B5E54] mb-8">
            Recent Teachings
          </h2>

          <div className="space-y-1">
            {teachings?.map((teaching) => (
              <Link
                key={teaching.teaching_number}
                href={`/teachings/${teaching.teaching_number}`}
                className="group flex items-baseline justify-between py-3.5 px-3 -mx-3 rounded hover:bg-[#EDE7DC] transition-colors"
              >
                <div className="flex items-baseline gap-5 min-w-0">
                  <span className="text-[#6B5E54] text-sm tabular-nums w-8 shrink-0">
                    {teaching.teaching_number}
                  </span>
                  <span className="text-[#2C2522] group-hover:text-[#7A3E3E] text-lg transition-colors truncate">
                    {teaching.title}
                  </span>
                </div>
                {teaching.year && (
                  <span className="text-[#6B5E54] text-sm ml-6 shrink-0">
                    {teaching.year}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 pt-10 border-t border-[#E5DFD5] text-center text-sm text-[#6B5E54]">
          {teachings?.length
            ? `Showing ${teachings.length} of 3,298 teachings`
            : ''}
        </footer>
      </div>
    </main>
  )
}