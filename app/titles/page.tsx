import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TitlesList from '@/components/TitlesList'

export default async function TitlesPage() {
  const supabase = await createClient()

  const { data: teachings, error } = await supabase
    .from('teachings')
    .select('teaching_number, title, year, date')
    .order('teaching_number', { ascending: true })

  if (error) {
    console.error(error)
  }

  const all = teachings || []

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        {/* Consistent site header */}
        {/* Positionally stable header */}
<header className="mb-16 text-center">
  <div className="min-h-[4.5rem] sm:min-h-[5.25rem] flex items-center justify-center mb-3">
    <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#2C2522]">
      Titles
    </h1>
  </div>
  <p className="text-[#6B5E54] text-lg italic mb-8 min-h-[1.75rem]">
    The full spine of the conversation
  </p>
  <nav className="flex flex-wrap justify-center items-center gap-5 text-sm">
    <Link href="/" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Home</Link>
    <span className="text-[#E5DFD5]">·</span>
    <Link href="/quotes" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Quotes</Link>
    <span className="text-[#E5DFD5]">·</span>
    <Link href="/search" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Search</Link>
    <span className="text-[#E5DFD5]">·</span>
    <Link href="/browse" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Browse</Link>
    <span className="text-[#E5DFD5]">·</span>
    <Link href="/titles" className="text-[#7A3E3E] font-medium">Titles</Link>
  </nav>
</header>

        <p className="text-center text-[#6B5E54] mb-10">
          {all.length.toLocaleString()} teachings
        </p>

        <TitlesList teachings={all} />
      </div>
    </main>
  )
}