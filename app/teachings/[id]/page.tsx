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
          {/* Teaching number + Year (left / right) */}
          <div className="flex justify-between text-sm text-[#6B5E54] mb-1">
            <span>Teaching {teaching.teaching_number}</span>
            {teaching.year && <span>{teaching.year}</span>}
          </div>

          {/* Title (centered) */}
          <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-4 text-center">
            {teaching.title}
          </h1>

          {/* Date/Time + Location (left / right) */}
          {(teaching.date || teaching.time || teaching.location1 || teaching.location2) && (
            <div className="flex justify-between text-sm text-[#6B5E54]">
              <span>
                {teaching.date}
                {teaching.time && ` • ${teaching.time}`}
              </span>
              {(teaching.location1 || teaching.location2) && (
                <span>
                  {teaching.location1}
                  {teaching.location2 && ` • ${teaching.location2}`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <article className="max-w-none text-[#2C2522] leading-[1.85] space-y-5 text-[1.05rem]">
          {teaching.full_text.split(/\n\n+/).map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Previous / Next - right justified */}
        <div className="mt-16 flex justify-end text-sm border-t border-[#E5DFD5] pt-6">
          {prev && (
            <Link href={`/teachings/${prev.teaching_number}`} className="hover:text-[#7A3E3E] mr-8">
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link href={`/teachings/${next.teaching_number}`} className="hover:text-[#7A3E3E]">
              {next.title} →
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}