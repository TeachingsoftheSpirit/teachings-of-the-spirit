import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TitlesList from '@/components/TitlesList'
import { getMembershipLevel, canAccess } from '@/lib/membership'
export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const { year: yearParam } = await params
  const year = parseInt(yearParam, 10)
  if (isNaN(year)) notFound()
  const level = await getMembershipLevel()
  const allowBrowse = canAccess(level, 'browse_open')
  if (!allowBrowse) {
    return (
      <main className="min-h-screen bg-[#F7F4EF]">
        <Header active="browse" />
        <div className="max-w-lg mx-auto px-6 pt-24 pb-24 text-center">
          <h1 className="text-2xl font-medium text-[#2C2522] mb-3">
            Further in
          </h1>
          <p className="text-[#6B5E54] text-[17px] leading-relaxed mb-2">
            The year shelves open with membership.
          </p>
          <p className="text-[#8A7B65] text-[15px] leading-relaxed mb-10">
            You can still see the map of years on the Browse page. The shelves
            themselves are for those who have come further in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/browse"
              className="inline-block text-[15px] text-[#2C2522] border border-[#C9BEB0] rounded-sm px-5 py-2.5 hover:bg-[#EDE4D4] transition-colors"
            >
              Return to Browse
            </Link>
            <Link
              href="/"
              className="inline-block text-[15px] text-[#2C2522] border border-[#C9BEB0] rounded-sm px-5 py-2.5 hover:bg-[#EDE4D4] transition-colors"
            >
              Main Room
            </Link>
          </div>
        </div>
      </main>
    )
  }
  const supabase = await createClient()
  const { data: teachings } = await supabase
    .from('teachings')
    .select('teaching_number, title, year, date, slug')
    .eq('year', year)
    .order('teaching_number', { ascending: true })
  if (!teachings || teachings.length === 0) notFound()
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
        <TitlesList teachings={teachings} />
      </div>
    </main>
  )
}