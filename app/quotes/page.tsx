import Header from '@/components/Header'
import Link from 'next/link'

async function getQuotes() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
  const { data } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: true })
  return data || []
}

export default async function QuotesPage() {
  const quotes = await getQuotes()

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="quotes" />

      <div className="max-w-3xl mx-auto px-6 pt-10 pb-8">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-3 text-center">
          Quotes
        </h1>
        <p className="text-lg text-[#6B5E54] italic text-center mb-12">
          A Mesmerizing Look into the Mind of God
        </p>

        <div className="space-y-16">
          {quotes.map((quote) => (
            <blockquote key={quote.id} className="border-l-0 pl-0">
              <p className="text-[#2C2522] text-[1.1rem] leading-[1.85] whitespace-pre-wrap">
                “{quote.quote_text}”
              </p>
              <footer className="mt-6 text-sm text-[#6B5E54]">
                {quote.teaching_number ? (
                  <Link
                    href={`/teachings/${quote.teaching_number}`}
                    className="hover:text-[#7A3E3E] transition-colors"
                  >
                    — {quote.title} · {quote.date}
                  </Link>
                ) : (
                  <span>— {quote.title} · {quote.date}</span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </main>
  )
}