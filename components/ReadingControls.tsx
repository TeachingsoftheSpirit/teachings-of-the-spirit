'use client'

import { useEffect, useState, type ReactNode } from 'react'

const FONT_KEY = 'tos-font-size'
const DARK_KEY = 'tos-reading-dark'
const FOCUS_KEY = 'tos-focus'

type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const sizeClass: Record<FontSize, string[]> = {
  xs: ['text-[14px]', 'leading-6'],
  sm: ['text-[16px]', 'leading-7'],
  md: ['text-[18px]', 'leading-8'],
  lg: ['text-[20px]', 'leading-8'],
  xl: ['text-[22px]', 'leading-9'],
  '2xl': ['text-[24px]', 'leading-9'],
}

const allSizeTokens = Object.values(sizeClass).flat()
const cycle: FontSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

const btn =
  'w-6 h-6 flex items-center justify-center rounded text-[#6B5E54] hover:text-[#2C2522] hover:bg-[#EDE8DF] disabled:opacity-30 transition-colors'

type Props = {
  leftExtra?: ReactNode
  rightExtra?: ReactNode
}

export default function ReadingControls({ leftExtra, rightExtra }: Props) {
  const [font, setFont] = useState<FontSize>('md')
  const [dark, setDark] = useState(false)
  const [focus, setFocus] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const f = localStorage.getItem(FONT_KEY) as FontSize | null
      const d = localStorage.getItem(DARK_KEY) === '1'
      const fo = localStorage.getItem(FOCUS_KEY) === '1'
      if (f && cycle.includes(f)) setFont(f)
      setDark(d)
      setFocus(fo)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const el = document.getElementById('teaching-body')
    if (!el) return
    el.classList.remove(...allSizeTokens)
    el.classList.add(...sizeClass[font])
    try {
      localStorage.setItem(FONT_KEY, font)
    } catch {
      /* ignore */
    }
  }, [font, ready])

  useEffect(() => {
    if (!ready) return
    const root = document.getElementById('reading-root')
    if (root) root.classList.toggle('reading-dark', dark)
    try {
      localStorage.setItem(DARK_KEY, dark ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [dark, ready])

  useEffect(() => {
    if (!ready) return
    document.body.classList.toggle('reading-focus', focus)
    try {
      localStorage.setItem(FOCUS_KEY, focus ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [focus, ready])

  const smaller = () => {
    const i = cycle.indexOf(font)
    if (i > 0) setFont(cycle[i - 1])
  }
  const larger = () => {
    const i = cycle.indexOf(font)
    if (i < cycle.length - 1) setFont(cycle[i + 1])
  }

  if (!ready) return null

  return (
    <div className="reading-controls flex items-center justify-between w-full select-none">
      {/* Left: moon + eye */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setDark((v) => !v)}
          title={dark ? 'Light reading' : 'Dark reading'}
          className={btn}
        >
          {dark ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => setFocus((v) => !v)}
          title={focus ? 'Show chrome' : 'Focus on the words'}
          className={`${btn} ${focus ? 'text-[#2C2522] bg-[#EDE8DF]' : ''}`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      {/* Center: Marginalia · Categories */}
      <div className="flex items-center gap-4">
        {leftExtra}
        {rightExtra}
      </div>

      {/* Right: A− A+ */}
      <div className="flex items-center gap-0.5">
        <button type="button" onClick={smaller} disabled={font === 'xs'} title="Smaller text" className={btn}>
          <span className="text-[11px] font-medium">A−</span>
        </button>
        <button type="button" onClick={larger} disabled={font === '2xl'} title="Larger text" className={btn}>
          <span className="text-[13px] font-medium">A+</span>
        </button>
      </div>
    </div>
  )
}