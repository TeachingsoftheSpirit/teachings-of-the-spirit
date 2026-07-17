import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import TitlesList from '@/components/TitlesList'

export default async function TitlesPage() {
  const supabase = await createClient()

  const { data: teachings } = await supabase
    .from('teachings')
    .select('teaching_number, title, year, date')
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
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 content-area rounded-xl p-8">
        {teachings && teachings.length > 0 ? (
          <TitlesList teachings={teachings} />
        ) : (
          <p className="text-[#6B5E54]">No teachings found.</p>
        )}
      </div>
    </main>
  )
}