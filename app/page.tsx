import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

const gateways = [
  {
    href: '/teachings/796',
    image: '/gateway-spirit.jpg',
    text: 'I, the Holy Spirit, work in many ways. I interpret and reteach ways of living and believing that I offered as Jesus, but I am not limited to these.',
  },
  {
    href: '/teachings/86',
    image: '/gateway-death.jpg',
    text: 'Death is My other door. You move out of one of My realms at birth, and at death you pass through another door into another non-earthly existence. Life continues.',
  },
  {
    href: '/teachings/74',
    image: '/gateway-rhythm.jpg',
    text: 'This time is important… the time of writing. Here is where the instruction comes. This is your school… and My School.',
  },
  {
    href: '/teachings/117',
    image: '/gateway-grace.jpg',
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
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

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
            <Link href="/" className="text-[#7A3E3E] font-medium drop-shadow-[0_0_8px_rgba(122,62,62,0.45)]">Home</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/quotes" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Quotes</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/search" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Search</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/browse" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Browse</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/titles" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Titles</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/about" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">About</Link>
          </nav>
        </header>

        {/* Optional tiny landscape accent */}
        <div className="mb-14 flex justify-center">
          <div className="relative w-40 sm:w-48 aspect-[16/10] rounded-md overflow-hidden border border-[#E5DFD5]">
            <Image
              src="/home-hero.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="192px"
              priority
            />
          </div>
        </div>

        <form action="/search" method="get" className="mb-16">
          <input
            type="search"
            name="q"
            placeholder="Search the teachings..."
            className="w-full px-5 py-3.5 rounded-lg border border-[#E5DFD5] bg-white text-[#2C2522] placeholder:text-[#6B5E54] focus:outline-none focus:ring-1 focus:ring-[#7A3E3E] focus:border-[#7A3E3E] text-lg"
          />
        </form>

        {/* Image + one-liner gateways */}
        <section className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-12">
            {gateways.map((g) => (
              <Link key={g.href} href={g.href} className="group block text-center">
                <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-4 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={g.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="280px"
                  />
                </div>
                <p className="text-[#2C2522] text-[0.95rem] leading-relaxed px-2 group-hover:text-[#7A3E3E] transition-colors">
                  “{g.text}”
                </p>
              </Link>
            ))}
          </div>
        </section>

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