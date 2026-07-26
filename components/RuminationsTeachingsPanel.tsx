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
  pageMap: Record<string, number[]>
}

export default function RuminationsTeachingsPanel({
  teachings,
  pageCount,
  pageMap,
}: Props) {
  const [activePages, setActivePages] = useState<number[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    for (let i = 1; i <= pageCount; i++) {
      const el = document.getElementById(`rum-page-${i}`)
      if (!el) continue

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const pageNum = parseInt(
              entry.target.id.replace('rum-page-', ''),
              10
            )
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

  const activeTeachingNums = new Set<number>()
  activePages.forEach((p) => {
    ;(pageMap[String(p)] || []).forEach((n) => activeTeachingNums.add(n))
  })

  return (
    <aside
      className="hidden xl:block fixed top-40 z-20"
      style={{ left: 'calc(50% + 26rem)' }}
    >
      <div className="w-48 bg-[#F7F4EF] border border-[#D4CBBF] shadow-[0_4px_20px_rgba(44,37,34,0.12)] rounded-sm p-3.5 max-h-[calc(100vh-12rem)] flex flex-col">
        <h2 className="text-[9px] tracking-widest uppercase text-[#8A7B65] mb-2.5 text-center shrink-0">
          Contemplated Teachings
        </h2>
        <ul className="space-y-2.5 overflow-y-auto pr-1">
          {teachings.map((t) => {
            const isActive = activeTeachingNums.has(t.teaching_number)
            return (
              <li key={t.teaching_number}>
                <Link
                  href={`/teachings/${t.teaching_number}`}
                  className={`block group transition-all duration-300 focus:outline-none ${
                    isActive
                      ? 'text-[#00C853] [text-shadow:0_0_12px_rgba(0,220,120,0.85),0_0_28px_rgba(0,200,100,0.55)]'
                      : 'hover:text-[#00C853] hover:[text-shadow:0_0_12px_rgba(0,220,120,0.85),0_0_28px_rgba(0,200,100,0.55)]'
                  }`}
                >
                  <div
                    className={`text-[10px] tabular-nums transition-colors duration-300 ${
                      isActive
                        ? 'text-[#00A844] font-medium'
                        : 'text-[#8A7B65] group-hover:text-[#00A844]'
                    }`}
                  >
                    #{t.teaching_number}
                  </div>
                  <div
                    className={`text-[11px] leading-snug transition-colors duration-300 ${
                      isActive
                        ? 'text-[#00C853] font-semibold'
                        : 'text-[#2C2522] group-hover:text-[#00C853]'
                    }`}
                  >
                    {t.title}
                  </div>
                  <div
                    className={`text-[9px] mt-0.5 transition-colors duration-300 ${
                      isActive
                        ? 'text-[#00A844]'
                        : 'text-[#8A7B65] group-hover:text-[#00A844]'
                    }`}
                  >
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