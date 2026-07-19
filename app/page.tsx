'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const supabase = createClient()

  const [featuredTeachings, setFeaturedTeachings] = useState<any[]>([])
  const [filteredTeachings, setFilteredTeachings] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [activatedId, setActivatedId] = useState<number | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // === The 7 Palantíri — Stepped Upward Smile Arc ===
  const palantiri = [
    { id: 1, topic: "Death",        word: "Death",        angle: 10, size: 62,  top: -42 },
    { id: 2, topic: "Grace",        word: "Grace",        angle: 6,  size: 74,  top: -28 },
    { id: 3, topic: "Soul",         word: "Soul",         angle: 3,  size: 86,  top: -14 },
    { id: 4, topic: "Spirit",       word: "Spirit",       angle: 0,  size: 96,  top: 0   },
    { id: 5, topic: "Eternal Life", word: "Eternal Life", angle: -3, size: 86,  top: -14 },
    { id: 6, topic: "Sin",          word: "Sin",          angle: -6, size: 74,  top: -28 },
    { id: 7, topic: "Forgiveness",  word: "Forgiveness",  angle: -10, size: 62, top: -42 },
  ]

  const topicKeywords: Record<string, string[]> = {
    "Death":        ["death", "die", "dying", "grave"],
    "Grace":        ["grace", "gracious"],
    "Soul":         ["soul"],
    "Spirit":       ["spirit", "holy spirit"],
    "Eternal Life": ["eternal", "everlasting", "eternal life"],
    "Sin":          ["sin"],
    "Forgiveness":  ["forgive", "forgiveness", "mercy"],
  }

  useEffect(() => {
    fetchFeatured()
  }, [])

  const fetchFeatured = async () => {
    const { data } = await supabase
      .from('teachings')
      .select('teaching_number, title, date')
      .order('teaching_number', { ascending: false })
      .limit(7)
    setFeaturedTeachings(data || [])
  }

  const fetchForTopic = async (word: string) => {
    const keywords = topicKeywords[word] || [word.toLowerCase()]
    const orConditions = keywords
      .map(k => `title.ilike.%${k}%,full_text.ilike.%${k}%`)
      .join(',')

    const { data } = await supabase
      .from('teachings')
      .select('teaching_number, title, date')
      .or(orConditions)
      .limit(5)

    setFilteredTeachings(data || [])
    setActiveFilter(word)
    setActivatedId(null)
  }

  const clearFilter = () => {
    setActiveFilter(null)
    setFilteredTeachings([])
  }

  // === 0.5 Second Hover + Persistent Word ===
  const handleMouseEnter = (id: number) => {
    setHoveredId(id)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      setActivatedId(id)
    }, 500)
  }

  const handleMouseLeave = () => {
    setHoveredId(null)
  }

  const handleWordClick = (word: string) => {
    fetchForTopic(word)
  }

  const teachingsToShow = activeFilter ? filteredTeachings : featuredTeachings

  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#2C2522]">
      <Header active="home" />

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-medium tracking-tight">Teachings of the Spirit</h1>
          <p className="mt-3 text-[#6B5E54] text-lg">A private library of spiritual teachings received over many years</p>
        </div>

        {/* Titles block */}
        <div className="mb-16 pl-[280px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium tracking-tight">
              {activeFilter 
                ? `Teachings on ${activeFilter}` 
                : "Teachings selected to be of interest to you..."}
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
                  href={`/teachings/${t.teaching_number}`}
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
              <div className="text-[#6B5E54] py-4">No teachings found for this topic yet.</div>
            )}
          </div>
        </div>

        {/* === THE PALANTÍRI CIRCLES === */}
        <div className="mt-8">
          <div className="text-center mb-6">
            <div className="text-[#6B5E54] text-sm">• Hover to Awaken •</div>
          </div>

          {/* Stepped upward smile arc */}
          <div className="flex justify-center items-center gap-4 pb-6" style={{ height: '160px' }}>
            {palantiri.map((p) => {
              const isHovered = hoveredId === p.id
              const isActivated = activatedId === p.id

              return (
                <div
                  key={p.id}
                  className={`group relative flex-shrink-0 transition-all duration-500 cursor-pointer ${isActivated ? 'scale-[1.06] z-10' : ''}`}
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    transform: `rotate(${p.angle}deg)`,
                    position: 'relative',
                    top: `${p.top}px`,
                  }}
                  onMouseEnter={() => handleMouseEnter(p.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* The Stone */}
                  <div
                    className={`w-full h-full rounded-full relative overflow-hidden border transition-all duration-500
                      bg-[radial-gradient(circle_at_35%_30%,#5a4a7a_0%,#2a2140_45%,#0f0d22_100%)]
                      border-[#5c4a7a] shadow-[inset_0_8px_18px_rgba(255,255,255,0.07),inset_0_-18px_28px_rgba(0,0,0,0.95),0_0_18px_rgba(90,70,140,0.35)]
                      ${isHovered && !isActivated ? 'animate-[vibrate_120ms_infinite]' : ''}
                      ${isActivated 
                        ? 'shadow-[inset_0_8px_18px_rgba(255,255,255,0.14),inset_0_-18px_28px_rgba(0,0,0,0.98),0_0_55px_rgba(185,160,255,0.75)] border-[#b8a0e0]' 
                        : ''}
                    `}
                  >
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_32%,rgba(210,195,255,0.35)_0%,transparent_60%)]" />
                    <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#ffffff08_0px,#ffffff08_1px,transparent_1px,transparent_3px)]" />

                    {/* Fixed word — stays visible until another circle is activated */}
                    {isActivated && (
                      <div className="absolute inset-0 flex items-center justify-center p-2 transition-all duration-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleWordClick(p.word)
                          }}
                          className="px-4 py-1 text-center text-[10px] md:text-xs font-medium tracking-[1.5px] text-white/95 bg-black/40 hover:bg-black/55 active:bg-black/65 backdrop-blur-md rounded-full border border-white/20 transition-all active:scale-[0.985] leading-tight"
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

          {/* The Palantíri Circles text — smaller + closer */}
          <div className="text-center -mt-2">
            <div className="text-[#2C2522] text-[15px] font-medium tracking-tight">The Palantíri Circles</div>
          </div>
        </div>
      </div>

      {/* Vibration Keyframe */}
      <style jsx global>{`
        @keyframes vibrate {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-0.5px, 0.5px); }
          50% { transform: translate(0.5px, -0.4px); }
          75% { transform: translate(-0.4px, 0.4px); }
        }
      `}</style>
    </main>
  )
}