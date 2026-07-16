'use client'

import { useState } from 'react'
import Link from 'next/link'

type Teaching = {
  teaching_number: number
  title: string
  year: number | null
  date: string | null
}

const THEMES: { name: string; keywords: string[] }[] = [
  { name: 'Death', keywords: ['death', 'dying', 'die'] },
  { name: 'Grace', keywords: ['grace'] },
  { name: 'Easter', keywords: ['easter', 'resurrection', 'hallelujah'] },
  { name: 'Christmas', keywords: ['christmas', 'nativity', 'incarnation'] },
  { name: 'Rhythm', keywords: ['rhythm'] },
  { name: 'Faith', keywords: ['faith', 'faithfulness'] },
  { name: 'Spirit', keywords: ['spirit', 'holy spirit'] },
  { name: 'Love', keywords: ['love'] },
  { name: 'Forgiveness', keywords: ['forgive', 'forgiveness'] },
  { name: 'Health', keywords: ['health', 'healing', 'ill-health'] },
  { name: 'Prayer', keywords: ['prayer', 'pray'] },
  { name: 'Scripture', keywords: ['scripture', 'bible'] },
  { name: 'Eternal Life', keywords: ['eternal', 'everlasting', 'immortal'] },
  { name: 'Pearl Harbor', keywords: ['pearl harbor'] },
]

function getThemes(title: string): string[] {
  const lower = title.toLowerCase()
  return THEMES
    .filter(t => t.keywords.some(k => lower.includes(k)))
    .map(t => t.name)
}

export default function TitlesList({ teachings }: { teachings: Teaching[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [hovered, setHovered] = useState<number | null>(null)

  const byTheme: Record<string, Teaching[]> = {}
  for (const t of teachings) {
    const themes = getThemes(t.title)
    for (const theme of themes) {
      if (!byTheme[theme]) byTheme[theme] = []
      byTheme[theme].push(t)
    }
  }

  // Numbers that belong to the same family as the hovered title
  const relatedToHovered = new Set<number>()
  if (hovered !== null) {
    const hoveredTeaching = teachings.find(t => t.teaching_number === hovered)
    if (hoveredTeaching) {
      const themes = getThemes(hoveredTeaching.title)
      for (const theme of themes) {
        for (const r of byTheme[theme] || []) {
          relatedToHovered.add(r.teaching_number)
        }
      }
    }
  }

  function toggle(num: number) {
    setExpanded(prev => ({ ...prev, [num]: !prev[num] }))
  }

  return (
    <div className="space-y-0.5">
      {teachings.map((t) => {
        const themes = getThemes(t.title)
        const hasRelated = themes.some(theme => (byTheme[theme]?.length || 0) > 1)
        const isOpen = expanded[t.teaching_number]
        const isDimmed = hovered !== null && !relatedToHovered.has(t.teaching_number)

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

        const dateLabel = t.date || (t.year ? String(t.year) : '')

        return (
          <div
            key={t.teaching_number}
            className={`transition-opacity duration-300 ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
          >
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
                    onMouseEnter={() => setHovered(t.teaching_number)}
                    onMouseLeave={() => setHovered(null)}
                    className="ml-1 text-[#7A3E3E]/70 hover:text-[#7A3E3E] transition-colors text-sm leading-none"
                    title={isOpen ? 'Hide related teachings' : 'Show related teachings'}
                    aria-label={isOpen ? 'Collapse related' : 'Expand related'}
                  >
                    {isOpen ? '❖' : '✦'}
                  </button>
                )}
              </div>

              {dateLabel && (
                <span className="text-[#6B5E54] text-sm shrink-0 tabular-nums">
                  {dateLabel}
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
                    {(r.date || r.year) && (
                      <span className="text-[#6B5E54]/80 text-xs shrink-0 tabular-nums">
                        {r.date || r.year}
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
  )
}