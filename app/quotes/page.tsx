import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Header from '@/components/Header'

function cleanQuoteText(text: string, title?: string): string {
  if (!text) return ''
  
  let cleaned = text.trim()
  
  // Remove leading quote + date (handles "November 21, 1979", "May 24, 1979", "1982", etc.)
  cleaned = cleaned.replace(
    /^["'“”]?\s*(?:[A-Za-z]+\.?\s+\d{1,2},?\s*\d{4}|\d{4})\s*["'“”]?\s*/,
    ''
  )
  
  // Remove any remaining leading quotes or dashes
  cleaned = cleaned.replace(/^["'“”\-\s]+/, '')
  
  // Remove trailing repeated title
  if (title) {
    const titleRegex = new RegExp(
      `\\s*[-–—]?\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`,
      'i'
    )
    cleaned = cleaned.replace(titleRegex, '')
  }
  
  // Final trim
  cleaned = cleaned.replace(/^["'“”\-\s]+|["'“”\-\s]+$/g, '').trim()
  
  return cleaned
}

export default async function QuotesPage() {
  const supabase = await createClient()
  
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
            {quotes.map((quote) => {
              const cleanText = cleanQuoteText(quote.quote_text || '', quote.title)
              return (
                <div key={quote.id} className="border-l-4 border-[#7A3E3E] pl-6">
                  <p className="text-[#2C2522] text-lg leading-[1.85] mb-4">
                    “{cleanText}”
                  </p>
                  <div className="text-sm text-[#6B5E54]">
                    {quote.title ? (
                      quote.teaching_number ? (
                        <Link 
                          href={`/teachings/${quote.teaching_number}`} 
                          className="hover:text-[#7A3E3E] transition-colors font-medium"
                        >
                          — {quote.title}
                        </Link>
                      ) : (
                        <span>— {quote.title}</span>
                      )
                    ) : null}
                    {quote.date && <span>{quote.title ? ' · ' : '— '}{quote.date}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-[#6B5E54]">
            No quotes found in database.
          </p>
        )}
      </div>
    </main>
  )
}