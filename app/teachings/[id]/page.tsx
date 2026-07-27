import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import Header from '@/components/Header'
import SaveTeachingButton from '@/components/SaveTeachingButton'
import CheckMarginalia from '@/components/CheckMarginalia'
import GaladrielsMirror from '@/components/GaladrielsMirror'
import {
  getMembershipLevel,
  canAccess,
} from '@/lib/membership'
type Props = {
  params: Promise<{ id: string }>
}
export default async function TeachingPage({ params }: Props) {
  const { id: slugOrId } = await params
  const level = await getMembershipLevel()
  const allowAny = canAccess(level, 'read_any_teaching')
  const allowPrevNext = canAccess(level, 'previous_next')
  const allowGaladriel = canAccess(level, 'galadriels_mirror')
  const allowRuminations = canAccess(level, 'ruminations_full')
  const supabase = await createClient()
  // Prefer slug; fall back to teaching_number if the segment is purely numeric
  const isNumeric = /^\d+$/.test(slugOrId)
  const { data: teaching } = await supabase
    .from('teachings')
    .select('*')
    .eq(isNumeric ? 'teaching_number' : 'slug', isNumeric ? parseInt(slugOrId, 10) : slugOrId)
    .single()
  if (!teaching) {
    notFound()
  }
  const teachingNumber = teaching.teaching_number as number
  // Anonymous may only open Teachings currently featured on the Main Room
  let allowThis = allowAny
  if (!allowAny) {
    const cookieStore = await cookies()
    const raw = cookieStore.get('tos_featured')?.value || ''
    const featured = raw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n))
    allowThis = featured.includes(teachingNumber)
  }
  if (!allowThis) {
    return (
      <main className="min-h-screen bg-[#F7F4EF]">
        <div className="sticky top-0 z-50 bg-[#F7F4EF] border-b border-[#C9BEB0]">
          <Header active="teachings" />
        </div>
        <div className="max-w-lg mx-auto px-6 pt-24 pb-24 text-center">
          <h1 className="text-2xl font-medium text-[#2C2522] mb-3">
            Further in
          </h1>
          <p className="text-[#6B5E54] text-[17px] leading-relaxed mb-2">
            This Teaching is not among those open at the threshold.
          </p>
          <p className="text-[#8A7B65] text-[15px] leading-relaxed mb-10">
            The wider library opens when you leave your email at the door —
            click “Further up and further in!”
          </p>
          <Link
            href="/"
            className="inline-block text-[15px] text-[#2C2522] border border-[#C9BEB0] rounded-sm px-5 py-2.5 hover:bg-[#EDE4D4] transition-colors"
          >
            Return to the Main Room
          </Link>
        </div>
      </main>
    )
  }
  let prevSlug: string | null = null
  let nextSlug: string | null = null
  if (allowPrevNext) {
    if (teachingNumber > 1) {
      const { data: prev } = await supabase
        .from('teachings')
        .select('slug')
        .eq('teaching_number', teachingNumber - 1)
        .maybeSingle()
      prevSlug = prev?.slug ?? null
    }
    const { data: next } = await supabase
      .from('teachings')
      .select('slug')
      .eq('teaching_number', teachingNumber + 1)
      .maybeSingle()
    nextSlug = next?.slug ?? null
  }
  const { data: rumLinks } = await supabase
    .from('ruminations_teachings')
    .select(
      `
      rumination_id,
      ruminations (
        slug,
        volume,
        number,
        title,
        date_text
      )
    `
    )
    .eq('teaching_number', teachingNumber)
  const relatedRuminations = (rumLinks || [])
    .map((row: any) => row.ruminations)
    .filter(Boolean)
  const prevClass =
    allowPrevNext && prevSlug
      ? 'text-[#6B5E54] hover:text-[#7A3E3E]'
      : 'text-[#6B5E54] pointer-events-none opacity-30'
  const nextClass =
    allowPrevNext && nextSlug
      ? 'text-[#6B5E54] hover:text-[#7A3E3E]'
      : 'text-[#6B5E54] pointer-events-none opacity-30'
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="sticky top-0 z-50 bg-[#F7F4EF] border-b border-[#C9BEB0]">
        <Header active="teachings" />
      </div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-3">
          <Link
            href={prevSlug ? `/teachings/${prevSlug}` : '#'}
            className={prevClass}
            aria-disabled={!prevSlug}
          >
            ← Previous Teaching
          </Link>
          <div className="flex flex-col items-center gap-1.5">
            <SaveTeachingButton
              teachingNumber={teachingNumber}
              teachingTitle={teaching.title}
            />
                       <CheckMarginalia
              teachingNumber={teachingNumber}
              teachingTitle={teaching.title}
            />
          </div>
          <Link
            href={nextSlug ? `/teachings/${nextSlug}` : '#'}
            className={nextClass}
            aria-disabled={!nextSlug}
          >
            Next Teaching →
          </Link>
        </div>
        <div className="flex justify-between items-start mb-6 mt-5">
          <div className="text-left w-36">
            <div className="text-sm text-[#6B5E54]">{teaching.date}</div>
            {teaching.start_time && (
              <div className="text-sm text-[#6B5E54]">{teaching.start_time}</div>
            )}
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-[#2C2522] text-center flex-1 px-4">
            {teaching.title}
          </h1>
          <div className="text-right w-36">
            {teaching.location1 && (
              <div className="text-sm text-[#6B5E54]">{teaching.location1}</div>
            )}
            {teaching.location2 && (
              <div className="text-sm text-[#6B5E54]">{teaching.location2}</div>
            )}
          </div>
        </div>
        {teaching.video_url && allowGaladriel && (
          <div className="text-center mb-8">
            <GaladrielsMirror
              videoUrl={teaching.video_url}
              title={teaching.title}
            />
          </div>
        )}
        {teaching.video_url && !allowGaladriel && (
          <div className="text-center mb-8">
            <div className="inline-block px-5 py-3 rounded-sm border border-[#D4CBBF] bg-white/50 text-[13px] text-[#8A7B65]">
              Galadriel’s Mirror opens with the Private Reserve
            </div>
          </div>
        )}
        <article>
          <div className="text-[#2C2522] leading-[1.85] text-[1.12rem] space-y-5">
            {teaching.full_text.split(/\n\n+/).map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>
        {(teaching.closing_phrase || teaching.end_time) && (
          <div className="mt-12 text-right">
            {teaching.closing_phrase && (
              <div className="italic text-[#2C2522]">{teaching.closing_phrase}</div>
            )}
            {teaching.end_time && (
              <div className="text-sm text-[#6B5E54] mt-1">{teaching.end_time}</div>
            )}
          </div>
        )}
        {relatedRuminations.length > 0 && allowRuminations && (
          <div className="mt-16 pt-8 border-t border-[#E5DFD3]">
            <p className="text-[13px] text-[#8A7B65] text-center mb-5">
              This Teaching was also referenced in
            </p>
            <ul className="space-y-5 max-w-md mx-auto">
              {relatedRuminations.map((r: any) => (
                <li key={r.slug}>
                  <Link
                    href={`/ruminations/${r.slug}?from=${teachingNumber}`}
                    className="block text-center group transition-all duration-300
                      hover:[text-shadow:0_0_12px_rgba(0,220,120,0.85),0_0_28px_rgba(0,200,100,0.55)]
                      focus:outline-none"
                  >
                    <div className="text-[15px] font-medium text-[#2C2522] group-hover:text-[#00C853] transition-colors duration-300">
                      Russell’s Ruminations
                    </div>
                    <div className="text-[13px] text-[#8A7B65] mt-0.5 group-hover:text-[#00A844] transition-colors duration-300">
                      Vol. {r.volume}, No. {r.number}
                      {r.date_text ? ` · ${r.date_text}` : ''}
                    </div>
                    <div className="text-[15px] text-[#2C2522] group-hover:text-[#00C853] transition-colors duration-300 mt-0.5">
                      {r.title}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {relatedRuminations.length > 0 && !allowRuminations && (
          <div className="mt-16 pt-8 border-t border-[#E5DFD3] text-center">
            <p className="text-[13px] text-[#8A7B65]">
              This Teaching is also referenced in Russell’s Ruminations
            </p>
            <p className="text-[12px] text-[#8A7B65] mt-1">
              Full access opens with the Private Reserve
            </p>
          </div>
        )}
      </div>
      <div className="max-w-3xl mx-auto px-6 pb-12 flex justify-between text-sm border-t border-[#C9BEB0] pt-6">
        <Link
          href={prevSlug ? `/teachings/${prevSlug}` : '#'}
          className={prevClass}
          aria-disabled={!prevSlug}
        >
          ← Previous Teaching
        </Link>
        <Link
          href={nextSlug ? `/teachings/${nextSlug}` : '#'}
          className={nextClass}
          aria-disabled={!nextSlug}
        >
          Next Teaching →
        </Link>
      </div>
    </main>
  )
}