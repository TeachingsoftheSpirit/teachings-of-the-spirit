import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import SaveTeachingButton from '@/components/SaveTeachingButton'

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

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-[#F7F4EF] border-b border-[#C9BEB0]">
        <Header active="teachings" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Top Navigation + Save */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href={teachingNumber > 1 ? `/teachings/${teachingNumber - 1}` : '#'}
            className={`text-[#6B5E54] hover:text-[#7A3E3E] ${teachingNumber === 1 ? 'pointer-events-none opacity-30' : ''}`}
          >
            ← Previous Teaching
          </Link>

          <SaveTeachingButton 
  teachingNumber={teachingNumber} 
  teachingTitle={teaching.title} 
/>

          <Link
            href={`/teachings/${teachingNumber + 1}`}
            className="text-[#6B5E54] hover:text-[#7A3E3E]"
          >
            Next Teaching →
          </Link>
        </div>

        {/* Metadata + Title */}
        <div className="flex justify-between items-start mb-10">
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

        {/* Body */}
        <article>
          <div className="text-[#2C2522] leading-[1.85] text-[1.12rem] space-y-5">
            {teaching.full_text.split(/\n\n+/).map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        {/* Closing */}
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
      </div>

      {/* Bottom Navigation */}
      <div className="max-w-3xl mx-auto px-6 pb-12 flex justify-between text-sm border-t border-[#C9BEB0] pt-6">
        <Link
          href={teachingNumber > 1 ? `/teachings/${teachingNumber - 1}` : '#'}
          className={`text-[#6B5E54] hover:text-[#7A3E3E] ${teachingNumber === 1 ? 'pointer-events-none opacity-30' : ''}`}
        >
          ← Previous Teaching
        </Link>
        <Link
          href={`/teachings/${teachingNumber + 1}`}
          className="text-[#6B5E54] hover:text-[#7A3E3E]"
        >
          Next Teaching →
        </Link>
      </div>
    </main>
  )
}