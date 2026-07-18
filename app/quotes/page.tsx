import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Header from '@/components/Header'

export default async function QuotesPage() {
  const supabase = createClient()
  
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('*')
    .order('year', { ascending: true })
    .order('teaching_number', { ascending: true })

  if (error) {
    console.error('Error fetching quotes:', error)
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="quotes" />
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-20">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-2 text-center">
          Quotes
        </h1>
        <p className="text-center text-[#6B5E54] mb-10">
          A mesmerizing look into the mind of God
        </p>

        {quotes && quotes.length > 0 ? (
          <div className="space-y-12">
            {quotes.map((quote) => (
              <div key={quote.id} className="border-l-4 border-[#7A3E3E] pl-6">
                <p className="text-[#2C2522] text-lg leading-[1.85] mb-4">
                  “{quote.quote_text}”
                </p>
                <div className="text-sm text-[#6B5E54]">
                  {quote.teaching_number ? (
                    <Link 
                      href={`/teachings/${quote.teaching_number}`} 
                      className="hover:text-[#7A3E3E] transition-colors font-medium"
                    >
                      — {quote.title}
                    </Link>
                  ) : (
                    <span>— {quote.title}</span>
                  )}
                  {quote.date && <span> · {quote.date}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#6B5E54]">
            No quotes found. (Data is in Supabase — import if needed.)
          </p>
        )}
      </div>
    </main>
  )
}