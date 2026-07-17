import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearParam } = await params
  const year = parseInt(yearParam, 10)

  if (isNaN(year)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: teachings } = await supabase
    .from('teachings')
    .select('teaching_number, title, date')
    .eq('year', year)
    .order('teaching_number', { ascending: true })

  if (!teachings || teachings.length === 0) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="browse" />

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522]">
          {year}
        </h1>
        <p className="mt-2 text-lg text-[#6B5E54] italic">
          {teachings.length} teaching{teachings.length !== 1 ? 's' : ''} from {year}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 content-area rounded-xl p-8">
        <div className="space-y-3">
          {teachings.map((t) => (
            <Link
              key={t.teaching_number}
              href={`/teachings/${t.teaching_number}`}
              className="flex justify-between items-baseline p-4 rounded-xl border border-[#C9BEB0] hover:border-[#7A3E3E] transition-colors bg-white/60 hover:bg-white group"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-[#6B5E54] text-sm tabular-nums w-12">
                  {t.teaching_number}
                </span>
                <span className="text-[#2C2522] group-hover:text-[#7A3E3E]">
                  {t.title}
                </span>
              </div>
              {t.date && (
                <span className="text-[#6B5E54] text-sm shrink-0 hidden sm:inline">
                  {t.date}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}