'use client'

import { useState } from 'react'
import Link from 'next/link'

type Teaching = {
  teaching_number: number
  title: string
  year: number | null
  date: string | null
}

type SortConfig = {
  key: 'date' | 'title'
  direction: 'asc' | 'desc'
}

export default function TitlesList({ teachings }: { teachings: Teaching[] }) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'asc',
  })
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  // Sorting logic
  const sortedTeachings = [...teachings].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
    } else {
      const titleA = a.title.toLowerCase()
      const titleB = b.title.toLowerCase()
      if (titleA < titleB) return sortConfig.direction === 'asc' ? -1 : 1
      if (titleA > titleB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    }
  })

  const requestSort = (key: 'date' | 'title') => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const getSortIndicator = (key: 'date' | 'title') => {
    if (sortConfig.key !== key) return ''
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  // Theme logic (kept from before)
  const THEMES = [
    { name: 'Death', keywords: ['death', 'dying', 'die'] },
    { name: 'Grace', keywords: ['grace'] },
    { name: 'Easter', keywords: ['easter', 'resurrection'] },
    { name: 'Rhythm', keywords: ['rhythm'] },
    { name: 'Faith', keywords: ['faith'] },
    { name: 'Spirit', keywords: ['spirit', 'holy spirit'] },
  ]

  function getThemes(title: string): string[] {
    const lower = title.toLowerCase()
    return THEMES
      .filter((t) => t.keywords.some((k) => lower.includes(k)))
      .map((t) => t.name)
  }

  const byTheme: Record<string, Teaching[]> = {}
  for (const t of sortedTeachings) {
    const themes = getThemes(t.title)
    for (const theme of themes) {
      if (!byTheme[theme]) byTheme[theme] = []
      byTheme[theme].push(t)
    }
  }

  function toggle(num: number) {
    setExpanded((prev) => ({ ...prev, [num]: !prev[num] }))
  }

  return (
    <div>
      {/* Sortable headers - now correctly aligned */}
      <div className="flex justify-between text-xs uppercase tracking-widest text-[#6B5E54] mb-4 px-2">
        <button
          onClick={() => requestSort('title')}
          className="hover:text-[#7A3E3E] transition-colors flex items-center gap-1"
        >
          Title{getSortIndicator('title')}
        </button>
        <button
          onClick={() => requestSort('date')}
          className="hover:text-[#7A3E3E] transition-colors flex items-center gap-1"
        >
          Date{getSortIndicator('date')}
        </button>
      </div>

      <div className="space-y-0.5">
        {sortedTeachings.map((t) => {
          const themes = getThemes(t.title)
          const hasRelated = themes.length > 0
          const isOpen = expanded[t.teaching_number]

          let related: Teaching[] = []
          if (isOpen && hasRelated) {
            const seen = new Set<number>()
            for (const theme of themes) {
              for (const r of byTheme[theme] || []) {
                if (r.teaching_number !== t.teaching_number && !seen.has(r.teaching_number)) {
                  seen.add(r.teaching_number)
                  related.push(r)
                }
              }
            }
            related.sort((a, b) => a.teaching_number - b.teaching_number)
          }

          return (
            <div key={t.teaching_number}>
              <div className="group flex items-baseline justify-between gap-3 py-2.5 px-2 -mx-2 rounded-md hover:bg-[#EDE7DC] transition-colors">
                <div className="flex items-baseline gap-4 min-w-0 flex-1">
                  <span className="text-[#6B5E54] text-sm tabular-nums w-12 shrink-0">
                    {t.teaching_number}
                  </span>

                  <Link
                    href={`/teachings/${t.teaching_number}`}
                    className="text-[#2C2522] group-hover:text-[#7A3E3E] text-[1.05rem] leading-snug"
                  >
                    {t.title}
                  </Link>

                  {hasRelated && (
                    <button
                      onClick={() => toggle(t.teaching_number)}
                      className="ml-1 text-[#7A3E3E]/70 hover:text-[#7A3E3E] transition-colors text-sm"
                      title={isOpen ? 'Hide related' : 'Show related teachings'}
                    >
                      {isOpen ? '❖' : '✦'}
                    </button>
                  )}
                </div>

                {t.date && (
                  <span className="text-[#6B5E54] text-sm shrink-0 tabular-nums">
                    {t.date}
                  </span>
                )}
              </div>

              {isOpen && related.length > 0 && (
                <div className="ml-16 pl-4 border-l border-[#E5DFD5]/80 mb-2 mt-0.5 space-y-0">
                  {related.map((r) => (
                    <Link
                      key={r.teaching_number}
                      href={`/teachings/${r.teaching_number}`}
                      className="flex items-baseline justify-between gap-4 py-1 text-[0.9rem] text-[#5C534A] hover:text-[#7A3E3E] transition-colors"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="text-[#6B5E54]/80 text-xs tabular-nums w-10 shrink-0">
                          {r.teaching_number}
                        </span>
                        <span className="leading-snug">{r.title}</span>
                      </div>
                      {r.date && (
                        <span className="text-[#6B5E54]/80 text-xs shrink-0 tabular-nums">
                          {r.date}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}