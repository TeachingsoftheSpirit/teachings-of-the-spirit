'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/client'

function setFeaturedCookie(ids: number[]) {
  // Read by the Teaching page server gate for anonymous visitors
  document.cookie = `tos_featured=${ids.join(',')}; path=/; max-age=86400; SameSite=Lax`
}

type Circle = {
  id: string // category uuid
  word: string // category name
  angle: number
  size: number
  top: number
}

const CIRCLE_LAYOUT = [
  { angle: 10, size: 72, top: -42 },
  { angle: 6, size: 80, top: -28 },
  { angle: 3, size: 88, top: -14 },
  { angle: 0, size: 96, top: 0 },
  { angle: -3, size: 88, top: -14 },
  { angle: -6, size: 80, top: -28 },
  { angle: -10, size: 72, top: -42 },
]

export default function Home() {
  const supabase = createClient()
  const [featuredTeachings, setFeaturedTeachings] = useState<any[]>([])
  const [filteredTeachings, setFilteredTeachings] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activatedId, setActivatedId] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [palantiri, setPalantiri] = useState<Circle[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const FEATURED_STORAGE_KEY = 'home-featured-ids'
  const PALANTIRI_STORAGE_KEY = 'home-palantiri-ids'

  function getRandomSubset<T>(arr: T[], n: number): T[] {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy.slice(0, n)
  }

  // Auth state
  useEffect(() => {
    const apply = (user: { email?: string | null } | null) => {
      setIsAnonymous(!user)
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      apply(user)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load featured teachings (unchanged logic)
  useEffect(() => {
    const loadFeatured = async () => {
      const stored = sessionStorage.getItem(FEATURED_STORAGE_KEY)
      if (stored) {
        try {
          const ids: number[] = JSON.parse(stored)
          if (Array.isArray(ids) && ids.length === 7) {
            const { data } = await supabase
              .from('teachings')
              .select('teaching_number, title, date, slug')
              .in('teaching_number', ids)
            if (data && data.length === 7) {
              const ordered = ids
                .map((id) => data.find((t) => t.teaching_number === id))
                .filter(Boolean) as any[]
              setFeaturedTeachings(ordered)
              setFeaturedCookie(ids)
              return
            }
          }
        } catch {
          // fall through
        }
      }
      const { data } = await supabase
        .from('teachings')
        .select('teaching_number, title, date, slug')
        .limit(300)
      if (data && data.length > 0) {
        const selected = getRandomSubset(data, 7)
        const ids = selected.map((t) => t.teaching_number)
        setFeaturedTeachings(selected)
        sessionStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(ids))
        setFeaturedCookie(ids)
      }
    }
    loadFeatured()
  }, [])

  // Load or generate the seven Palantíri circles from real categories
  useEffect(() => {
    const loadPalantiri = async () => {
      const stored = sessionStorage.getItem(PALANTIRI_STORAGE_KEY)
      if (stored) {
        try {
          const ids: string[] = JSON.parse(stored)
          if (Array.isArray(ids) && ids.length === 7) {
            const { data } = await supabase
              .from('categories')
              .select('id, name')
              .in('id', ids)
            if (data && data.length === 7) {
              const ordered = ids
                .map((id, index) => {
                  const cat = data.find((c) => c.id === id)
                  if (!cat) return null
                  return {
                    id: cat.id,
                    word: cat.name,
                    ...CIRCLE_LAYOUT[index],
                  }
                })
                .filter(Boolean) as Circle[]
              if (ordered.length === 7) {
                setPalantiri(ordered)
                return
              }
            }
          }
        } catch {
          // fall through
        }
      }
      // Generate new random set for this session
      const { data } = await supabase
        .from('categories')
        .select('id, name')
      if (data && data.length >= 7) {
        const selected = getRandomSubset(data, 7)
        const circles: Circle[] = selected.map((cat, index) => ({
          id: cat.id,
          word: cat.name,
          ...CIRCLE_LAYOUT[index],
        }))
        setPalantiri(circles)
        sessionStorage.setItem(
          PALANTIRI_STORAGE_KEY,
          JSON.stringify(selected.map((c) => c.id))
        )
      }
    }
    loadPalantiri()
  }, [])

  // Click a circle → fetch 7 random Teachings that belong to that category
  const fetchForCategory = async (categoryId: string, categoryName: string) => {
    const { data } = await supabase
      .from('teaching_categories')
      .select(
        `
        teachings (
          teaching_number,
          title,
          date,
          slug
        )
      `
      )
      .eq('category_id', categoryId)
      .limit(40)
    if (data && data.length > 0) {
      const teachings = data
        .map((row: any) => row.teachings)
        .filter(Boolean)
      const selected = getRandomSubset(teachings, 7)
      setFilteredTeachings(selected)
    } else {
      setFilteredTeachings([])
    }
    setActiveFilter(categoryName)
    setActivatedId(null)
  }

  const clearFilter = () => {
    setActiveFilter(null)
    setFilteredTeachings([])
  }

  const handleMouseEnter = (id: string) => {
    setHoveredId(id)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActivatedId(id)
    }, 375)
  }

  const handleMouseLeave = () => {
    setHoveredId(null)
  }

  const handleWordClick = (circle: Circle) => {
    if (isAnonymous) return
    fetchForCategory(circle.id, circle.word)
  }

  const teachingsToShow = activeFilter ? filteredTeachings : featuredTeachings

  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#2C2522]">
      <Header active="home" />
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-medium tracking-tight">Teachings of the Spirit</h1>
          <p className="mt-3 text-[#6B5E54] text-lg">
            A private library of spiritual teachings received over many years
          </p>
        </div>

        <div className="mb-16 pl-0 sm:pl-[280px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium tracking-tight">
              {activeFilter
                ? `Teachings on ${activeFilter}`
                : 'Teachings selected to be of interest to you...'}
            </h2>
            {activeFilter && (
              <button
                onClick={clearFilter}
                className="text-sm text-[#6B5E54] hover:text-[#2C2522] flex items-center gap-1 transition-colors"
              >
                ← Back to evocative collection
              </button>
            )}
          </div>
          <div className="space-y-1">
            {teachingsToShow.length > 0 ? (
              teachingsToShow.map((t) => (
                <Link
                  key={t.teaching_number}
                  href={`/teachings/${t.slug || t.teaching_number}`}
                  className="group flex items-baseline gap-5 py-1.5 border-b border-[#EDE8DF] hover:border-[#7A3E3E] transition-colors"
                >
                  <span className="text-sm text-[#6B5E54] tabular-nums w-28 shrink-0">
                    {t.date}
                  </span>
                  <span className="text-[#2C2522] group-hover:text-[#7A3E3E] transition-colors">
                    {t.title}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-[#6B5E54] py-4">
                {activeFilter
                  ? 'No teachings found for this category yet.'
                  : 'Loading…'}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="text-center mb-1">
            <div className="text-[#6B5E54] text-sm">• Hover to Awaken •</div>
          </div>
          <div
            className="flex justify-center items-center gap-4 pb-2"
            style={{ height: '160px' }}
          >
            {palantiri.map((p) => {
              const isHovered = hoveredId === p.id
              const isActivated = activatedId === p.id
              return (
                <div
                  key={p.id}
                  className={`group relative flex-shrink-0 transition-all duration-500 ${
                    isAnonymous ? 'cursor-default' : 'cursor-pointer'
                  } ${isActivated ? 'scale-[1.06] z-10' : ''}`}
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    transform: `rotate(${p.angle}deg)`,
                    position: 'relative',
                    top: `${p.top}px`,
                  }}
                  onMouseEnter={() => handleMouseEnter(p.id)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleWordClick(p)}
                >
                  <div
                    className={`w-full h-full rounded-full relative overflow-hidden border transition-all duration-500
                      bg-[radial-gradient(circle_at_35%_30%,#5a4a7a_0%,#2a2140_45%,#0f0d22_100%)]
                      border-[#5c4a7a] shadow-[inset_0_8px_18px_rgba(255,255,255,0.07),inset_0_-18px_28px_rgba(0,0,0,0.95),0_0_18px_rgba(90,70,140,0.35)]
                      ${isHovered && !isActivated ? 'animate-[vibrate_120ms_infinite]' : ''}
                      ${
                        isActivated
                          ? 'shadow-[inset_0_8px_18px_rgba(255,255,255,0.14),inset_0_-18px_28px_rgba(0,0,0,0.98),0_0_55px_rgba(185,160,255,0.75)] border-[#b8a0e0]'
                          : ''
                      }
                    `}
                  >
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_32%,rgba(210,195,255,0.35)_0%,transparent_60%)]" />
                    <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#ffffff08_0px,#ffffff08_1px,transparent_1px,transparent_3px)]" />
                    {isActivated && (
                      <div className="absolute inset-0 flex items-center justify-center p-2 transition-all duration-500">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleWordClick(p)
                          }}
                          className={`px-4 py-1 text-center text-[10px] md:text-xs font-medium tracking-[1.5px] text-white/95 bg-black/40 backdrop-blur-md rounded-full border border-white/20 leading-tight ${
                            isAnonymous
                              ? 'cursor-default opacity-90'
                              : 'hover:bg-black/55 active:bg-black/65 active:scale-[0.985] cursor-pointer'
                          }`}
                        >
                          {p.word}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-center -mt-3">
            <div className="text-[#2C2522] text-[15px] font-medium tracking-tight">
              The Palantíri Circles
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes vibrate {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-0.5px, 0.5px);
          }
          50% {
            transform: translate(0.5px, -0.4px);
          }
          75% {
            transform: translate(-0.4px, 0.4px);
          }
        }
      `}</style>
    </main>
  )
}