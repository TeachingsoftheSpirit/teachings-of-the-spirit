'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'

interface Quote {
  id: string
  quote_text: string
  title: string
  date: string
  teaching_number: number | null
  year: number
}

interface Teaching {
  teaching_number: number
  title: string
  date: string
  start_time?: string
  location1?: string
  location2?: string
  full_text: string
  closing_phrase?: string
  end_time?: string
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedTeaching, setExpandedTeaching] = useState<Teaching | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  // Full expand is House Brew+ (Level 3). Anonymous and magic-link see quotes only.
  const [allowExpand, setAllowExpand] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data } = await supabase
        .from('quotes')
        .select('*')
        .order('year', { ascending: true })
      if (data) setQuotes(data)
    }
    fetchQuotes()
  }, [])

  useEffect(() => {
    const checkLevel = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setAllowExpand(false)
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('email', user.email.trim().toLowerCase())
        .maybeSingle()

      const status = (profile?.subscription_status || '').toLowerCase().trim()
      setAllowExpand(
        status === 'house_brew' ||
          status === 'private_reserve' ||
          status === 'ordinary_pint' ||
          status === 'patron'
      )
    }
    checkLevel()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkLevel()
    })
    return () => subscription.unsubscribe()
  }, [])

  const toggleExpand = async (quote: Quote) => {
    if (!allowExpand) return

    if (expandedId === quote.id) {
      setExpandedId(null)
      setExpandedTeaching(null)
      return
    }

    setLoadingId(quote.id)
    let teaching = null

    if (quote.teaching_number) {
      const { data } = await supabase
        .from('teachings')
        .select('*')
        .eq('teaching_number', quote.teaching_number)
        .single()
      if (data) teaching = data
    }

    if (!teaching) {
      const { data } = await supabase
        .from('teachings')
        .select('*')
        .ilike('title', quote.title)
        .eq('year', quote.year)
        .single()
      if (data) teaching = data
    }

    if (teaching) {
      setExpandedTeaching(teaching)
      setExpandedId(quote.id)
    }
    setLoadingId(null)
  }

  const renderHighlightedText = (fullText: string, quoteText: string) => {
    if (!quoteText) {
      return fullText.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)
    }
    const anchor = quoteText.trim().replace(/\s+/g, ' ').slice(0, 80)
    return fullText.split(/\n\n+/).map((para, i) => {
      const index = para.indexOf(anchor)
      if (index !== -1) {
        return (
          <p key={i}>
            {para.substring(0, index)}
            <strong className="font-bold text-[#2C2522] bg-[#EDE8DF] px-1.5 py-0.5 rounded">
              {anchor}
            </strong>
            {para.substring(index + anchor.length)}
          </p>
        )
      }
      return <p key={i}>{para}</p>
    })
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="quotes" />
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-20">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-2 text-center">
          Quotes
        </h1>
        <p className="text-center text-[#6B5E54] mb-6">
          A mesmerizing look into the mind of God
        </p>
        {!allowExpand && (
          <p className="text-center text-[14px] text-[#8A7B65] mb-10 max-w-md mx-auto leading-relaxed">
            The quotes are open to read. Opening the full Teaching is as simple
            as clicking on “Further up and further in!”
          </p>
        )}
        {allowExpand && <div className="mb-10" />}

        <div className="space-y-12">
          {quotes.map((quote) => {
            const isExpanded = expandedId === quote.id
            const isLoading = loadingId === quote.id

            return (
              <div key={quote.id} className="border-l-4 border-[#7A3E3E] pl-6">
                <p className="text-[#2C2522] text-lg leading-[1.85] mb-4">
                  “{quote.quote_text}”
                </p>

                {allowExpand ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(quote)}
                    className="group flex items-center gap-2 text-sm text-[#6B5E54] hover:text-[#7A3E3E] transition-colors"
                  >
                    <span className="font-medium">— {quote.title}</span>
                    {quote.date && <span>· {quote.date}</span>}
                    <span className="ml-1 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                      {isExpanded ? '↑ collapse' : '↓ read full teaching'}
                    </span>
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-2 text-sm text-[#6B5E54] opacity-45 cursor-default select-none"
                    aria-disabled="true"
                  >
                    <span className="font-medium">— {quote.title}</span>
                    {quote.date && <span>· {quote.date}</span>}
                    <span className="ml-1 text-xs">↓ read full teaching</span>
                  </div>
                )}

                {isExpanded && expandedTeaching && allowExpand && (
                  <div className="mt-8 pl-4 border-l border-[#C4B8A8] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="text-[#2C2522] leading-[1.9] text-[1.05rem] space-y-5">
                      {renderHighlightedText(
                        expandedTeaching.full_text,
                        quote.quote_text
                      )}
                    </div>
                    {(expandedTeaching.closing_phrase ||
                      expandedTeaching.end_time) && (
                      <div className="mt-8 text-right italic text-[#6B5E54]">
                        {expandedTeaching.closing_phrase}
                        {expandedTeaching.end_time &&
                          ` ${expandedTeaching.end_time}`}
                      </div>
                    )}
                  </div>
                )}
                {isLoading && (
                  <div className="mt-4 text-sm text-[#6B5E54] italic">
                    Loading full teaching…
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}