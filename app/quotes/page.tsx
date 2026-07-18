'use client'

import Header from '@/components/Header'
import { useState } from 'react'

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
            <QuoteItem key={quote.id} quote={quote} />
          ))}
        </div>
      </div>
    </main>
  )
}

function QuoteItem({ quote }: { quote: any }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <blockquote className="border-l-0 pl-0">
        <p className="text-[#2C2522] text-[1.1rem] leading-[1.85] whitespace-pre-wrap">
          “{quote.quote_text}”
        </p>
        <footer className="mt-6 text-sm text-[#6B5E54]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="hover:text-[#7A3E3E] transition-colors cursor-pointer"
          >
            — {quote.title} · {quote.date}
          </button>
        </footer>
      </blockquote>

      {expanded && (
        <div className="mt-8 border-l-4 border-[#C9BEB0] pl-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium text-[#2C2522]">
              {quote.title}
            </h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-sm text-[#6B5E54] hover:text-[#7A3E3E]"
            >
              ← Back to Quotes
            </button>
          </div>
          <p className="text-[#2C2522] leading-[1.85] whitespace-pre-wrap">
            {quote.full_text || quote.quote_text}
          </p>
        </div>
      )}
    </div>
  )
}