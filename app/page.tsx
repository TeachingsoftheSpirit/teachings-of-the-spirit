import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

const gateways = [
  {
    href: '/teachings/796',
    label: 'The Spirit',
    text: 'I, the Holy Spirit, work in many ways. I interpret and reteach ways of living and believing that I offered as Jesus, but I am not limited to these.',
  },
  {
    href: '/teachings/86',
    label: 'Death',
    text: 'Death is My other door. You move out of one of My realms at birth, and at death you pass through another door into another non-earthly existence. Life continues.',
  },
  {
    href: '/teachings/74',
    label: 'Rhythm',
    text: 'This time is important… the time of writing. Here is where the instruction comes. This is your school… and My School.',
  },
  {
    href: '/teachings/117',
    label: 'Grace',
    text: 'Grace is My given way. It is free access to Me, with no strings that I attach.',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: recent } = await supabase
    .from('teachings')
    .select('teaching_number, title, year')
    .order('teaching_number', { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="home" />

      {/* Title + Subtitle (kept exactly as you like them) */}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-medium tracking-tight text-[#2C2522]">
          Teachings of the Spirit
        </h1>
        <p className="mt-4 text-xl text-[#6B5E54] italic">
          A private library of spiritual teachings received over many years.
        </p>
      </div>

      {/* Search bar — moved up */}
      <div className="max-w-3xl mx-auto px-6">
        <form action="/search" method="get" className="mb-10">
          <input
            type="search"
            name="q"
            placeholder="Search the teachings..."
            className="w-full px-6 py-3.5 rounded-xl border border-[#E5DFD5] bg-white text-[#2C2522] placeholder:text-[#6B5E54] focus:outline-none focus:ring-2 focus:ring-[#7A3E3E]/20 text-lg"
          />
        </form>
      </div>

      {/* Text teachings (the alluring quotes) — now directly under search bar */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <h2 className="text-xs uppercase tracking-[3px] text-[#6B5E54] mb-6 text-center">
          Begin Here — Timeless First Steps
        </h2>
        <div className="space-y-6 text-[#2C2522]">
          {gateways.map((g, i) => (
            <Link
              key={i}
              href={g.href}
              className="block group hover:text-[#7A3E3E] transition-colors"
            >
              <span className="font-medium text-[#7A3E3E]">{g.label}</span> — {g.text}
            </Link>
          ))}
        </div>
      </div>

      {/* 3 small pics on either side (out of the way, serene) + Recent below center */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left side — 2 small pics (stacked) */}
          <div className="lg:w-40 flex-shrink-0 space-y-8 hidden lg:block">
            <Link href="/teachings/796" className="block group">
              <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border border-[#E5DFD5] shadow-sm">
                <Image
                  src="/gateway-spirit.jpg"
                  alt="The Spirit"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-center text-sm text-[#6B5E54] group-hover:text-[#7A3E3E]">
                The Spirit
              </p>
            </Link>

            <Link href="/teachings/86" className="block group">
              <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border border-[#E5DFD5] shadow-sm">
                <Image
                  src="/gateway-death.jpg"
                  alt="Death"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-center text-sm text-[#6B5E54] group-hover:text-[#7A3E3E]">
                Death &amp; Beyond
              </p>
            </Link>
          </div>

          {/* Center content (Recent teachings) */}
          <div className="flex-1">
            <h2 className="text-xs uppercase tracking-widest text-[#6B5E54] mb-4">
              Recent in the Archive
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
          </div>

          {/* Right side — 1 small pic */}
          <div className="lg:w-40 flex-shrink-0 hidden lg:block">
            <Link href="/teachings/117" className="block group">
              <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border border-[#E5DFD5] shadow-sm">
                <Image
                  src="/gateway-grace.jpg"
                  alt="Grace"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-center text-sm text-[#6B5E54] group-hover:text-[#7A3E3E]">
                Grace
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}