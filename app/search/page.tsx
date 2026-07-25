'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const apply = (user: { email?: string | null } | null) => {
      setIsAnonymous(!user)
    }
    supabase.auth.getUser().then(({ data: { user } }) => apply(user))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('teachings')
      .select('teaching_number, title, date, year')
      .or(`title.ilike.%${query}%,full_text.ilike.%${query}%`)
      .order('teaching_number', { ascending: true })
      .limit(50)
    setResults(data || [])
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="search" />
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522]">
          Search
        </h1>
        <p className="mt-2 text-lg text-[#6B5E54] italic">
          Search across all 3,298 teachings
        </p>
      </div>
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the teachings..."
            className="w-full px-5 py-3 rounded-full border border-[#C9BEB0] bg-white/70 text-[#2C2522] placeholder-[#6B5E54] focus:outline-none focus:border-[#7A3E3E] transition-colors text-base"
          />
        </form>

        {loading && (
          <p className="text-center text-[#6B5E54]">Searching...</p>
        )}

        {results.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-[#6B5E54] mb-4 text-center">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>

            {isAnonymous && (
              <p className="mb-6 text-center text-[14px] text-[#8A7B65] leading-relaxed max-w-md mx-auto">
                These titles are within reach. To open them — and the rest of what
                these rooms hold — please click on “Further up and further in!”
              </p>
            )}

            <div className="space-y-2">
              {results.map((t) => {
                const rowClass =
                  'flex justify-between items-baseline p-4 rounded-xl border border-[#C9BEB0] bg-white/60'

                if (isAnonymous) {
                  return (
                    <div
                      key={t.teaching_number}
                      className={`${rowClass} opacity-55 cursor-default select-none`}
                      aria-disabled="true"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="text-[#6B5E54] text-sm tabular-nums w-12">
                          {t.teaching_number}
                        </span>
                        <span className="text-[#2C2522]">{t.title}</span>
                      </div>
                      {t.date && (
                        <span className="text-[#6B5E54] text-sm shrink-0 hidden sm:inline">
                          {t.date}
                        </span>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={t.teaching_number}
                    href={`/teachings/${t.teaching_number}`}
                    className={`${rowClass} hover:border-[#7A3E3E] transition-colors hover:bg-white group`}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-[#6B5E54] text-sm tabular-nums w-12">
                        {t.teaching_number}
                      </span>
                      <span className="text-[#2C2522] group-hover:text-[#7A3E3E]">
                        {t.title}
                      </span>
                    </div>
                    {t.date && (
                      <span className="text-[#6B5E54] text-sm shrink-0 hidden sm:inline">
                        {t.date}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {query && results.length === 0 && !loading && (
          <p className="text-center text-[#6B5E54]">
            No results found for “{query}”.
          </p>
        )}
      </div>
    </main>
  )
}