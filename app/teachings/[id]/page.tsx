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
          {/* Row 1: Date (left) | Location 1 (right) */}
          <div className="flex justify-between text-sm text-[#6B5E54] mb-0.5">
            <span>{teaching.date}</span>
            <span>{teaching.location1}</span>
          </div>

          {/* Row 2: Time (left) | Location 2 (right) */}
          <div className="flex justify-between text-sm text-[#6B5E54] mb-4">
            <span>{teaching.time}</span>
            <span>{teaching.location2}</span>
          </div>

          {/* Centered Title */}
          <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-4 text-center">
            {teaching.title}
          </h1>

          {/* Row 3: Teaching number (left) | Year (right) */}
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

        {/* Bottom navigation - right aligned + end time below it */}
        <div className="mt-16 flex flex-col items-end text-sm border-t border-[#E5DFD5] pt-6">
          <div className="flex gap-8">
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

          {/* End / Closing time */}
          {teaching.end_time && (
            <span className="mt-1 text-[#6B5E54] text-sm">
              {teaching.end_time}
            </span>
          )}
        </div>
      </div>
    </main>
  )
}