import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: recent } = await supabase
    .from('teachings')
    .select('teaching_number, title, year')
    .order('teaching_number', { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        {/* Stable header */}
        <header className="mb-12 text-center">
          <div className="min-h-[4.5rem] sm:min-h-[5.25rem] flex items-center justify-center mb-3">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#2C2522]">
              Teachings of the Spirit
            </h1>
          </div>
          <p className="text-[#6B5E54] text-lg italic mb-8 min-h-[1.75rem]">
            A private library of spiritual teachings received over many years.
          </p>
          <nav className="flex flex-wrap justify-center items-center gap-5 text-sm">
            <Link href="/" className="text-[#7A3E3E] font-medium drop-shadow-[0_0_8px_rgba(122,62,62,0.45)]">
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
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/browse" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">
              Browse
            </Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/titles" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">
              Titles
            </Link>
          </nav>
        </header>

        {/* Hero image – Mirror / pool presence */}
        <div className="mb-16 rounded-lg overflow-hidden border border-[#E5DFD5] shadow-sm">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/hero.jpg"
              alt="A quiet vision of light and many rooms"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </div>

        {/* Search */}
        <form action="/search" method="get" className="mb-20">
          <input
            type="search"
            name="q"
            placeholder="Search the teachings..."
            className="w-full px-5 py-3.5 rounded-lg border border-[#E5DFD5] bg-white text-[#2C2522] placeholder:text-[#6B5E54] focus:outline-none focus:ring-1 focus:ring-[#7A3E3E] focus:border-[#7A3E3E] text-lg"
          />
        </form>

        {/* Gateway teachings */}
        <section className="mb-20">
          <h2 className="text-xs uppercase tracking-widest text-[#6B5E54] mb-8 text-center">
            Begin here
          </h2>

          <div className="space-y-10">
            <Link href="/teachings/86" className="block group">
              <p className="text-[#2C2522] text-xl leading-relaxed group-hover:text-[#7A3E3E] transition-colors">
                “Death is My other door. You move out of one of My realms at birth, and at death you pass through another door into another non-earthly existence. Life continues.”
              </p>
              <p className="mt-3 text-sm text-[#6B5E54]">
                Death · November 27, 1979
              </p>
            </Link>

            <Link href="/teachings/117" className="block group">
              <p className="text-[#2C2522] text-xl leading-relaxed group-hover:text-[#7A3E3E] transition-colors">
                “Grace is My given way. It is free access to Me, with no strings that I attach.”
              </p>
              <p className="mt-3 text-sm text-[#6B5E54]">
                Grace, Again · August 10, 1980
              </p>
            </Link>

            <Link href="/teachings/74" className="block group">
              <p className="text-[#2C2522] text-xl leading-relaxed group-hover:text-[#7A3E3E] transition-colors">
                “This time is important… the time of writing. Here is where the instruction comes. This is your school… and My School.”
              </p>
              <p className="mt-3 text-sm text-[#6B5E54]">
                Rhythm · May 22, 1979
              </p>
            </Link>

            <Link href="/teachings/796" className="block group">
              <p className="text-[#2C2522] text-xl leading-relaxed group-hover:text-[#7A3E3E] transition-colors">
                “I, the Holy Spirit, work in many ways. I interpret and reteach ways of living and believing that I offered as Jesus, but I am not limited to these.”
              </p>
              <p className="mt-3 text-sm text-[#6B5E54]">
                Christ, The Spirit · April 19, 1985
              </p>
            </Link>
          </div>
        </section>

        {/* Recent */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#6B5E54] mb-6">
            Recent in the archive
          </h2>
          <div className="space-y-1">
            {(recent || []).map((t) => (
              <Link
                key={t.teaching_number}
                href={`/teachings/${t.teaching_number}`}
                className="group flex items-baseline justify-between gap-4 py-3 px-2 -mx-2 rounded-md hover:bg-[#EDE7DC] transition-colors"
              >
                <div className="flex items-baseline gap-4 min-w-0">
                  <span className="text-[#6B5E54] text-sm tabular-nums w-12 shrink-0">
                    {t.teaching_number}
                  </span>
                  <span className="text-[#2C2522] group-hover:text-[#7A3E3E] text-lg">
                    {t.title}
                  </span>
                </div>
                {t.year && (
                  <span className="text-[#6B5E54] text-sm shrink-0">{t.year}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}