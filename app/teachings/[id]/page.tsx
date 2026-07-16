import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

export default async function TeachingPage({ params }: Props) {
  const { id } = await params
  const teachingNumber = parseInt(id, 10)

  if (isNaN(teachingNumber)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: teaching, error } = await supabase
    .from('teachings')
    .select('*')
    .eq('teaching_number', teachingNumber)
    .single()

  if (error || !teaching) {
    notFound()
  }

  const { data: prev } = await supabase
    .from('teachings')
    .select('teaching_number, title')
    .lt('teaching_number', teachingNumber)
    .order('teaching_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: next } = await supabase
    .from('teachings')
    .select('teaching_number, title')
    .gt('teaching_number', teachingNumber)
    .order('teaching_number', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">

        {/* Top navigation */}
        <nav className="mb-12 flex flex-wrap items-center justify-between gap-4 text-sm text-[#6B5E54]">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#2C2522] transition-colors">
              Home
            </Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/quotes" className="hover:text-[#2C2522] transition-colors">
              Quotes
            </Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/search" className="hover:text-[#2C2522] transition-colors">
              Search
            </Link>
          </div>
          <span>Teaching {teaching.teaching_number}</span>
        </nav>

        {/* Classic three-column header */}
        <header className="mb-14">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
            {/* Left: Date + Start Time */}
            <div className="text-sm text-[#6B5E54] text-left pt-1">
              {teaching.date && <div>{teaching.date}</div>}
              {teaching.start_time && <div className="mt-0.5">{teaching.start_time}</div>}
            </div>

            {/* Center: Title */}
            <h1 className="text-2xl sm:text-3xl font-medium tracking-wide text-[#2C2522] text-center uppercase leading-tight">
              {teaching.title}
            </h1>

            {/* Right: Location lines */}
            <div className="text-sm text-[#6B5E54] text-right pt-1">
              {teaching.location1 && <div>{teaching.location1}</div>}
              {teaching.location2 && <div className="mt-0.5">{teaching.location2}</div>}
            </div>
          </div>
        </header>

        {/* Body with real paragraphs */}
        <article>
          <div className="text-[#2C2522] leading-[1.9] text-[1.12rem] space-y-5">
  {teaching.full_text.split(/\n\n+/).map((para: string, i: number) => (
  <p key={i}>{para}</p>
))}
</div>
        </article>

        {/* Closing */}
        {(teaching.closing_phrase || teaching.end_time) && (
          <div className="mt-14 flex justify-end items-baseline gap-6">
            {teaching.closing_phrase && (
              <span className="italic text-[#2C2522]">{teaching.closing_phrase}</span>
            )}
            {teaching.end_time && (
              <span className="text-sm text-[#6B5E54]">{teaching.end_time}</span>
            )}
          </div>
        )}

        {/* Previous / Next */}
        <nav className="mt-20 pt-10 border-t border-[#E5DFD5] flex flex-col sm:flex-row gap-8 sm:justify-between text-sm">
          {prev ? (
            <Link href={`/teachings/${prev.teaching_number}`} className="group">
              <div className="text-xs uppercase tracking-wider text-[#6B5E54] mb-1">
                Previous
              </div>
              <div className="text-[#2C2522] group-hover:text-[#7A3E3E] transition-colors">
                ← {prev.title}
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/teachings/${next.teaching_number}`}
              className="group sm:text-right"
            >
              <div className="text-xs uppercase tracking-wider text-[#6B5E54] mb-1">
                Next
              </div>
              <div className="text-[#2C2522] group-hover:text-[#7A3E3E] transition-colors">
                {next.title} →
              </div>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </main>
  )
}