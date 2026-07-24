'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Teaching = {
  teaching_number: number
  title: string
  date: string
}

type Props = {
  teachings: Teaching[]
  pageCount: number
}

// Approximate page → teaching map for Vol. 2, No. 2
// (hand-authored for this experiment only)
const PAGE_MAP: Record<number, number[]> = {
  1: [],
  2: [],
  3: [139],
  4: [139, 140],
  5: [140, 141],
  6: [141, 142],
  7: [142, 90],
  8: [201],
  9: [201],
  10: [320],
  11: [320],
  12: [320],
}

export default function RuminationsTeachingsPanel({ teachings, pageCount }: Props) {
  const [activePages, setActivePages] = useState<number[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    for (let i = 1; i <= pageCount; i++) {
      const el = document.getElementById(`rum-page-${i}`)
      if (!el) continue

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const pageNum = parseInt(entry.target.id.replace('rum-page-', ''), 10)
            setActivePages((prev) => {
              if (entry.isIntersecting) {
                if (prev.includes(pageNum)) return prev
                return [...prev, pageNum].sort((a, b) => a - b)
              } else {
                return prev.filter((p) => p !== pageNum)
              }
            })
          })
        },
        {
          root: null,
          rootMargin: '-20% 0px -40% 0px',
          threshold: 0.1,
        }
      )
      obs.observe(el)
      observers.push(obs)
    }

    return () => observers.forEach((o) => o.disconnect())
  }, [pageCount])

  // Collect teaching numbers that should be highlighted right now
  const activeTeachingNums = new Set<number>()
  activePages.forEach((p) => {
    ;(PAGE_MAP[p] || []).forEach((n) => activeTeachingNums.add(n))
  })

  return (
    <aside
      className="hidden xl:block fixed top-40 z-20"
      style={{ left: 'calc(50% + 26rem)' }}
    >
      <div className="w-48 bg-[#F7F4EF] border border-[#D4CBBF] shadow-[0_4px_20px_rgba(44,37,34,0.12)] rounded-sm p-3.5">
        <h2 className="text-[9px] tracking-widest uppercase text-[#8A7B65] mb-2.5 text-center">
          Contemplated Teachings
        </h2>
        <ul className="space-y-2.5">
          {teachings.map((t) => {
            const isActive = activeTeachingNums.has(t.teaching_number)
            return (
              <li key={t.teaching_number}>
                <Link
                  href={`/teachings/${t.teaching_number}`}
                  className="block group"
                >
                  <div
                    className={`text-[10px] tabular-nums ${
                      isActive ? 'text-[#2C2522] font-medium' : 'text-[#8A7B65]'
                    }`}
                  >
                    #{t.teaching_number}
                  </div>
                  <div
                    className={`text-[11px] leading-snug transition-colors ${
                      isActive
                        ? 'text-[#2C2522] font-semibold'
                        : 'text-[#2C2522] group-hover:text-[#4A3F38]'
                    }`}
                  >
                    {t.title}
                  </div>
                  <div className="text-[9px] text-[#8A7B65] mt-0.5">
                    {t.date}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}