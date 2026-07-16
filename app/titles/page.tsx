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

        <nav className="mb-10 flex flex-wrap items-center gap-4 text-sm text-[#6B5E54]">
          <Link href="/" className="hover:text-[#2C2522] transition-colors">Home</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/quotes" className="hover:text-[#2C2522] transition-colors">Quotes</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/search" className="hover:text-[#2C2522] transition-colors">Search</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/browse" className="hover:text-[#2C2522] transition-colors">Browse</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/titles" className="hover:text-[#2C2522] transition-colors">Titles</Link>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#2C2522] mb-2">
            All Titles
          </h1>
          <p className="text-[#6B5E54]">
            {all.length.toLocaleString()} teachings
          </p>
        </header>

        <TitlesList teachings={all} />
      </div>
    </main>
  )
}