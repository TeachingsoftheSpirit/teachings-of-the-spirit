import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import TitlesList from '@/components/TitlesList'
import { getMembershipLevel, canAccess } from '@/lib/membership'

export default async function TitlesPage() {
  const level = await getMembershipLevel()
  const allowOpen = canAccess(level, 'titles_open')

  const supabase = await createClient()
  const { data: teachings } = await supabase
    .from('teachings')
    .select('teaching_number, title, year, date, slug')
    .order('teaching_number', { ascending: true })

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="titles" />
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522]">
          All Titles
        </h1>
        <p className="mt-2 text-lg text-[#6B5E54] italic">
          Scroll through every teaching title in order
        </p>
        {!allowOpen && (
          <p className="mt-4 text-[14px] text-[#8A7B65] max-w-md mx-auto leading-relaxed">
            Every title is here to read at a glance. Opening a Teaching — and the
            rest of these rooms — begins with clicking on “Further up and further
            in!”
          </p>
        )}
      </div>
      <div className="max-w-3xl mx-auto px-6 pb-16 content-area rounded-xl p-8">
        {teachings && teachings.length > 0 ? (
          <TitlesList teachings={teachings} allowOpen={allowOpen} />
        ) : (
          <p className="text-[#6B5E54]">No teachings found.</p>
        )}
      </div>
    </main>
  )
}