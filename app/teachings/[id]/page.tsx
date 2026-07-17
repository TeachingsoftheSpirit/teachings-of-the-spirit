import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import BackLink from '@/components/BackLink'

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

  const { data: teaching } = await supabase
    .from('teachings')
    .select('*')
    .eq('teaching_number', teachingNumber)
    .single()

  if (!teaching) {
    notFound()
  }

  const { data: prev } = await supabase
    .from('teachings')
    .select('teaching_number, title')
    .lt('teaching_number', teachingNumber)
    .order('teaching_number', { ascending: false })
    .limit(1)
    .single()

  const { data: next } = await supabase
    .from('teachings')
    .select('teaching_number, title')
    .gt('teaching_number', teachingNumber)
    .order('teaching_number', { ascending: true })
    .limit(1)
    .single()

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="home" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <BackLink fallback="/" />
        </div>

        {/* Header block */}
        <div className="mb-10">
          {/* Row 1: Date (left) + Time under it | Location 1 (right) + Location 2 under it */}
          <div className="flex justify-between text-sm text-[#6B5E54]">
            {/* Left column: Date + Time */}
            <div>
              <div>{teaching.date}</div>
              <div className="mt-0.5">{teaching.time}</div>
            </div>

            {/* Right column: Location 1 + Location 2 */}
            <div className="text-right">
              <div>{teaching.location1}</div>
              <div className="mt-0.5">{teaching.location2}</div>
            </div>
          </div>

          {/* Centered Title */}
          <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] my-5 text-center">
            {teaching.title}
          </h1>

          {/* Row below title: Teaching number (left) | Year (right) */}
          <div className="flex justify-between text-sm text-[#6B5E54]">
            <span>Teaching {teaching.teaching_number}</span>
            {teaching.year && <span>{teaching.year}</span>}
          </div>
        </div>

        {/* Body */}
        <article className="max-w-none text-[#2C2522] leading-[1.85] space-y-5 text-[1.05rem]">
          {teaching.full_text.split(/\n\n+/).map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Bottom section: Navigation (left/right) + Closing time under it (right justified) */}
        <div className="mt-16 border-t border-[#E5DFD5] pt-6">
          <div className="flex justify-between text-sm">
            {prev && (
              <Link href={`/teachings/${prev.teaching_number}`} className="hover:text-[#7A3E3E]">
                ← {prev.title}
              </Link>
            )}
            {next && (
              <Link href={`/teachings/${next.teaching_number}`} className="hover:text-[#7A3E3E]">
                {next.title} →
              </Link>
            )}
          </div>

          {/* Closing / End time - right justified under the navigation */}
          {teaching.end_time && (
            <div className="mt-1 text-right text-sm text-[#6B5E54]">
              {teaching.end_time}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}