import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function QuotesPage() {
  const supabase = await createClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="quotes" />

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522]">
          Quotes
        </h1>
        <p className="mt-2 text-lg text-[#6B5E54] italic">
          A selection of powerful lines from the teachings
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 content-area rounded-xl p-8">
        {quotes && quotes.length > 0 ? (
          <div className="space-y-12">
            {quotes.map((quote) => (
              <blockquote key={quote.id} className="border-none">
                <p className="text-[#2C2522] text-lg leading-[1.85] whitespace-pre-wrap mb-3">
                  “{quote.quote_text}”
                </p>

                {/* Clickable footer with Title + Date */}
                <footer>
                  {quote.teaching_number ? (
                    <Link
                      href={`/teachings/${quote.teaching_number}`}
                      className="text-sm text-[#6B5E54] hover:text-[#7A3E3E] transition-colors"
                    >
                      — {quote.title}
                      {quote.date && <span> · {quote.date}</span>}
                    </Link>
                  ) : (
                    <span className="text-sm text-[#6B5E54]">
                      — {quote.title}
                      {quote.date && <span> · {quote.date}</span>}
                    </span>
                  )}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="text-[#6B5E54]">No quotes found yet.</p>
        )}
      </div>
    </main>
  )
}