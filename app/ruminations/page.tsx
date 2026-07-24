import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RuminationsPage() {
  const supabase = await createClient()

  const { data: ruminations, error } = await supabase
    .from('ruminations')
    .select('volume, number, title, date_text, slug, year')
    .order('publication_date', { ascending: true })

  if (error) {
    console.error('Error loading ruminations:', error)
  }

  const items = ruminations || []

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="ruminations" />

      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <header className="mb-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-medium text-[#2C2522] mb-3 tracking-wide">
            Ruminations
          </h1>
          <p className="text-[#6B5E54] text-[17px] leading-relaxed max-w-xl mx-auto">
            Letters of analysis and comment written over more than twenty years<br />
            to friends in the Spirit.
          </p>
        </header>

        <div className="space-y-0">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/ruminations/${item.slug}`}
              className="group flex flex-wrap sm:flex-nowrap items-baseline gap-x-5 gap-y-1 py-3.5 border-b border-[#E8E0D4] hover:bg-[#F0EBE3]/50 transition-colors px-2 -mx-2 rounded"
            >
              <span className="text-sm text-[#8A7B65] w-[7.5rem] shrink-0 tabular-nums">
                Vol. {item.volume}, No. {item.number}
              </span>
              <span className="text-sm text-[#8A7B65] w-36 shrink-0">
                {item.date_text}
              </span>
              <span className="text-[#2C2522] group-hover:text-[#4A3F38] transition-colors">
                {item.title}
              </span>
            </Link>
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-12 text-center text-[#8A7B65]">
            No Ruminations found.
          </p>
        )}
      </div>
    </main>
  )
}